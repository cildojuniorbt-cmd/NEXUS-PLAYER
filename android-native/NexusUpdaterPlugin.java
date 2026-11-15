package com.nexus.player;

import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Environment;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;

@CapacitorPlugin(name = "NexusUpdater")
public class NexusUpdaterPlugin extends Plugin {
    @PluginMethod
    public void startDownload(PluginCall call) {
        String url = call.getString("url");
        String fileName = safeFileName(call.getString("fileName", "nexus-player-update.apk"));
        if (url == null || !url.startsWith("https://")) {
            call.reject("A atualização precisa usar uma conexão HTTPS.");
            return;
        }
        try {
            DownloadManager manager = (DownloadManager) getContext().getSystemService(Context.DOWNLOAD_SERVICE);
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            request.setTitle("NEXUS PLAYER");
            request.setDescription("Baixando atualização...");
            request.setMimeType("application/vnd.android.package-archive");
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE);
            request.setAllowedOverMetered(true);
            request.setAllowedOverRoaming(false);
            request.setDestinationInExternalFilesDir(getContext(), Environment.DIRECTORY_DOWNLOADS, fileName);
            long id = manager.enqueue(request);
            JSObject result = new JSObject();
            result.put("downloadId", id);
            result.put("fileName", fileName);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Não foi possível iniciar o download.", error);
        }
    }

    @PluginMethod
    public void getDownloadStatus(PluginCall call) {
        long id = call.getLong("downloadId", -1L);
        if (id < 0) {
            call.reject("Identificador de download inválido.");
            return;
        }
        DownloadManager manager = (DownloadManager) getContext().getSystemService(Context.DOWNLOAD_SERVICE);
        try (android.database.Cursor cursor = manager.query(new DownloadManager.Query().setFilterById(id))) {
            if (cursor == null || !cursor.moveToFirst()) {
                call.reject("Download não encontrado.");
                return;
            }
            int status = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS));
            long downloaded = cursor.getLong(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR));
            long total = cursor.getLong(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_TOTAL_SIZE_BYTES));
            int reason = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_REASON));
            JSObject result = new JSObject();
            result.put("status", status == DownloadManager.STATUS_SUCCESSFUL ? "completed" :
                status == DownloadManager.STATUS_FAILED ? "failed" :
                status == DownloadManager.STATUS_PAUSED ? "paused" :
                status == DownloadManager.STATUS_PENDING ? "pending" :
                status == DownloadManager.STATUS_RUNNING ? "running" : "unknown");
            result.put("downloadedBytes", downloaded);
            result.put("totalBytes", total);
            result.put("progress", total > 0 ? Math.min(100, Math.round((downloaded * 100.0) / total)) : 0);
            result.put("reason", reason);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Não foi possível consultar o download.", error);
        }
    }

    @PluginMethod
    public void installApk(PluginCall call) {
        String fileName = safeFileName(call.getString("fileName", "nexus-player-update.apk"));
        try {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O &&
                !getContext().getPackageManager().canRequestPackageInstalls()) {
                Intent settings = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                    Uri.parse("package:" + getContext().getPackageName()));
                settings.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getActivity().startActivity(settings);
                JSObject result = new JSObject();
                result.put("permissionRequired", true);
                call.resolve(result);
                return;
            }
            File directory = getContext().getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
            File apk = new File(directory, fileName);
            if (!apk.isFile() || apk.length() == 0) {
                call.reject("O arquivo APK não foi encontrado ou está vazio.");
                return;
            }
            Uri uri = FileProvider.getUriForFile(getContext(),
                getContext().getPackageName() + ".fileprovider", apk);
            Intent install = new Intent(Intent.ACTION_VIEW);
            install.setDataAndType(uri, "application/vnd.android.package-archive");
            install.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(install);
            JSObject result = new JSObject();
            result.put("permissionRequired", false);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Não foi possível abrir o instalador do Android.", error);
        }
    }

    private String safeFileName(String value) {
        String name = value == null ? "nexus-player-update.apk" : value.replaceAll("[^A-Za-z0-9._-]", "_");
        if (!name.toLowerCase().endsWith(".apk")) name = name + ".apk";
        return name;
    }
}