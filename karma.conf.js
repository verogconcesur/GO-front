// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-coverage'),
      require('karma-spec-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      captureConsole: true, // disable console logs
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      jasmine: {
        random: false // Will execute tests in the given order
      }
    },
    coverageReporter: {
      // specify a common output directory
      dir: 'coverage/Concenet_Front',
      reporters: [{ type: 'lcovonly', subdir: '.', file: 'lcov.info' }, { type: 'html' }, { type: 'text-summary' }]
    },
    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'src/**/*.js': ['coverage']
    },
    reporters: ['spec', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    singleRun: false,
    restartOnFileChange: true
  });
};
