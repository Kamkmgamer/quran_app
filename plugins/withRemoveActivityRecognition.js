const { withAndroidManifest } = require("expo/config-plugins");

module.exports = function withRemoveActivityRecognition(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    if (androidManifest.manifest["uses-permission"]) {
      androidManifest.manifest["uses-permission"] =
        androidManifest.manifest["uses-permission"].filter(
          (perm) =>
            perm.$["android:name"] !==
            "android.permission.ACTIVITY_RECOGNITION"
        );
    }

    return config;
  });
};
