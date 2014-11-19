var gulp = require('gulp');
var handlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');
var clean = require('gulp-clean');
var bower = require('bower');

var watch = false;
process.argv.forEach(function (val, index, array) {
  if ( val == '-w' || val == '--watch' )
  {
    watch = true;
  }
});

gulp.task('clean', function(){
  return gulp.src(['www/*'], {read:false})
    .pipe(clean());
});

gulp.task('bower', function(cb){
  bower.commands.install([], {save: true}, {})
    .on('end', function(installed){
      cb(); // notify gulp that this task is finished
    });
});

gulp.task('move', function(){
  // the base option sets the relative root for the set of files,
  // preserving the folder structure
  gulp.src(['src/**/*.*', '!src/**/*.hbs'])
  .pipe(gulp.dest('./www'));
});

gulp.task('hbs', function () {
    var templateData = {},
    options = {
        batch : ['./src/html/_partials'],
        helpers : {}
    }

    return gulp.src(['src/html/**/*.hbs', '!src/html/_partials/**/*.*'])
        .pipe(handlebars(templateData, options))
        .pipe(rename(function (path) {
            path.extname = ".html"
        }))
        .pipe(gulp.dest('./www'));
})

gulp.task('default', ['bower','move', 'hbs']);
gulp.task('watch', function() {
  var watcher = gulp.watch('src/**/*.*', ['default']);
})
