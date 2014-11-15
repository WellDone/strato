var gulp = require('gulp');
var handlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');

var watch = false;
process.argv.forEach(function (val, index, array) {
  if ( val == '-w' || val == '--watch' )
  {
    watch = true;
  }
});

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

if ( watch )
{
    var watcher = gulp.watch('src/**/*.hbs', ['default']);
}
