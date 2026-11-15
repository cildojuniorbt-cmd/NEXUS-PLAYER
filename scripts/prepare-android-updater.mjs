import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const appId = 'com.nexus.player';
const javaPackagePath = appId.replaceAll('.', '/');
const javaDir = resolve(root, 'android/app/src/main/java', javaPackagePath);
const resDir = resolve(root, 'android/app/src/main/res/xml');
await mkdir(javaDir, { recursive: true });
await mkdir(resDir, { recursive: true });
await copyFile(resolve(root, 'android-native/NexusUpdaterPlugin.java'), resolve(javaDir, 'NexusUpdaterPlugin.java'));

const activityPath = resolve(javaDir, 'MainActivity.java');
await writeFile(activityPath, `package ${appId};

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NexusUpdaterPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
`);

const manifestPath = resolve(root, 'android/app/src/main/AndroidManifest.xml');
let manifest = await readFile(manifestPath, 'utf8');
if (!manifest.includes('android.permission.REQUEST_INSTALL_PACKAGES')) {
  manifest = manifest.replace('<application', '<uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />\n\n    <application');
}
if (!manifest.includes('com.nexus.player.fileprovider')) {
  manifest = manifest.replace('</application>', `        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${appId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/nexus_update_paths" />
        </provider>
    </application>`);
}
await writeFile(manifestPath, manifest);
await writeFile(resolve(resDir, 'nexus_update_paths.xml'), `<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <external-files-path name="nexus_updates" path="Download/" />
</paths>
`);
console.log('NEXUS native updater installed in generated Android project.');
