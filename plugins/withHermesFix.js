const {
  withAppBuildGradle,
  withGradleProperties,
} = require('@expo/config-plugins');

/**
 * Expo Config Plugin:
 * Ensures Hermes stays enabled, fixes missing .so libs (libhermestooling.so, etc),
 * and automatically restores gradle.properties if Expo regenerates it.
 */
module.exports = function withHermesFix(config) {
  //console.log('🧠 [HermesFix] Applying Hermes stabilization plugin...');

  // ✅ 1️⃣ Ensure Hermes is enabled in gradle.properties (auto-recovery safe)
  config = withGradleProperties(config, (config) => {
    const props = config.modResults;
    const ensureProp = (key, value) => {
      const entry = props.find((p) => p.key === key);
      if (entry) {
        if (entry.value !== value) {
          //console.log(`🔁 [HermesFix] Updating ${key}=${value}`);
          entry.value = value;
        }
      } else {
        //console.log(`➕ [HermesFix] Adding ${key}=${value}`);
        props.push({ type: 'property', key, value });
      }
    };

    ensureProp('expo.jsEngine', 'hermes');
    ensureProp('hermesEnabled', 'true');

    // Safeguard: some builds reset this flag
    const autoMarkerKey = 'hermesFix.autoLock';
    ensureProp(autoMarkerKey, 'true'); // invisible marker for next runs

    return config;
  });

  // ✅ 2️⃣ Patch app/build.gradle for Hermes + packagingOptions
  config = withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    if (!contents.includes('// Hermes fix applied via Expo plugin')) {
      //console.log('🧩 [HermesFix] Injecting packagingOptions + enableHermes');

      // Force enableHermes=true
      contents = contents.replace(
        /enableHermes\s*=\s*project\.ext\.react\.get\(['"]enableHermes['"],.*?\)/,
        'enableHermes = true'
      );

      // Add packagingOptions if missing
      if (!/packagingOptions\s*\{[\s\S]*libhermes\.so/.test(contents)) {
        contents += `
android {
    packagingOptions {
        pickFirst "**/libhermes.so"
        pickFirst "**/libhermestooling.so"
        pickFirst "**/libhermes-executor-debug.so"
        pickFirst "**/libhermes-executor-release.so"
        pickFirst "**/libc++_shared.so"
        pickFirst "**/libjsc.so"
    }
}
`;
        //console.log('✅ [HermesFix] Added packagingOptions for Hermes libraries.');
      }

      contents =
        '// Hermes fix applied via Expo plugin\n' + contents;
    } else {
      //console.log('ℹ️ [HermesFix] Already applied, skipping duplicate injection.');
    }

    config.modResults.contents = contents;
    return config;
  });

  //console.log('✅ [HermesFix] Completed successfully — Hermes locked and protected.');
  return config;
};
