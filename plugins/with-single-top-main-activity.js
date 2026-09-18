const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withSingleTopMainActivity(config) {
  return withAndroidManifest(config, (mod) => {
    const application = mod.modResults.manifest.application?.[0];
    const mainActivity = application?.activity?.find(
      (activity) => activity.$?.['android:name'] === '.MainActivity',
    );
    if (!mainActivity?.$) throw new Error('VOKA could not find Android MainActivity.');
    mainActivity.$['android:launchMode'] = 'singleTop';
    return mod;
  });
};
