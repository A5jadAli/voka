const { withMainApplication } = require('@expo/config-plugins');

const IMPORT_MARKER = 'import android.media.AudioAttributes';
const SETUP_MARKER = 'val vokaAudioAttributes = AudioAttributes.Builder()';

module.exports = function withWebRtcMediaAudio(config) {
  return withMainApplication(config, (mod) => {
    if (mod.modResults.language !== 'kt') {
      throw new Error('VOKA WebRTC media audio setup expects a Kotlin MainApplication.');
    }

    let source = mod.modResults.contents;
    if (!source.includes(IMPORT_MARKER)) {
      source = source.replace(
        'import android.app.Application',
        `import android.app.Application
import android.media.AudioAttributes`,
      );
      source = source.replace(
        'import com.facebook.react.PackageList',
        `import com.facebook.react.PackageList
import com.oney.WebRTCModule.WebRTCModuleOptions
import org.webrtc.audio.JavaAudioDeviceModule`,
      );
    }

    if (!source.includes(SETUP_MARKER)) {
      source = source.replace(
        '    super.onCreate()',
        `    super.onCreate()
    val vokaAudioAttributes = AudioAttributes.Builder()
      .setUsage(AudioAttributes.USAGE_MEDIA)
      .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
      .build()
    WebRTCModuleOptions.getInstance().audioDeviceModule = JavaAudioDeviceModule.builder(this)
      .setAudioAttributes(vokaAudioAttributes)
      .createAudioDeviceModule()`,
      );
    }

    mod.modResults.contents = source;
    return mod;
  });
};
