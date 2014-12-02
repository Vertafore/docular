var grunt = require('grunt');

grunt.initConfig({
    bump: {
        options: {
            pushTo: 'origin'
        }
    }
})

grunt.loadNpmTasks('grunt-bump');