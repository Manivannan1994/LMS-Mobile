const scanner = require('sonarqube-scanner');

scanner(
  {
    serverUrl: 'http://192.168.1.20:9000/',
    token: 'sqp_e91043a0276d7bd086ec57444f4a086441a454c4',
    options: {
      'sonar.projectDescription': 'lms project setup for sonar lint ',
      'sonar.projectKey': 'camu-lms',
      'sonar.sources': '.',
      'sonar.projectVersion': '0.0.1',
      'sonar.javascript.node.maxspace':'4096',
      'sonar.exclusions':
        'node_modules,public/**/*,src/assets/**/*',
      'sonar.sourceEncoding': 'UTF-8'
    }
  },
  () => process.exit()
);
