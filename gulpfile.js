var gulp = require('gulp');
var handlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');

gulp.task('default', function () {
    var templateData = {},
    options = {
        batch : ['./src/partials'],
        helpers : {}
    }

    return gulp.src('src/*.hbs')
        .pipe(handlebars(templateData, options))
        .pipe(rename(function (path) {
		        path.extname = ".html"
		    }))
        .pipe(gulp.dest('./www'));
});