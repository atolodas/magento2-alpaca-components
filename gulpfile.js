/* eslint-env node */

const autoprefixer = require('autoprefixer'),
      eslint      = require('gulp-eslint'),
      fractal     = require('@frctl/fractal').create(),
      fs          = require('fs-extra'),
      globby      = require('globby'),
      gulp        = require('gulp'),
      gulpif      = require('gulp-if'),
      hbsEngine   = fractal.components.engine(),
      logger      = fractal.cli.console,
      mandelbrot  = require('@frctl/mandelbrot'),
      notify      = require('gulp-notify'),
      plumber     = require('gulp-plumber'),
      postcss     = require('gulp-postcss'),
      reporter    = require('postcss-reporter'),
      runSequence = require('run-sequence'),
      sass        = require('gulp-sass'),
      sassError   = require('gulp-sass-error'),
      sassLint    = require('gulp-sass-lint'),
      sourcemaps  = require('gulp-sourcemaps'),
      stylelint   = require('stylelint'),
      svgSprite   = require('gulp-svg-sprite'),
      util        = require('gulp-util');

// Fractal configuration
fractal.set('project.title', 'Alpaca UI Components for Magento 2');
fractal.components.set('path', __dirname + '/components');
fractal.docs.set('path', __dirname + '/docs');
fractal.web.set('static.path', __dirname + '/public');
fractal.web.set('builder.dest', __dirname + '/dest');
fractal.web.theme(mandelbrot({ skin: 'black' }));

// Handlebars helpers
hbsEngine.handlebars.registerHelper('static', (file, data) => {
  return '/components/raw/' + data.data.root._self.baseHandle + '/' + file;
});

hbsEngine.handlebars.registerHelper('libs', file => `/components/raw/libs/${file}`);

hbsEngine.handlebars.registerHelper('inline', src => {
  return fs.readFileSync(fractal.web.get('static.path') + '/' + src, 'utf8');
});

// Fractal gulp tasks
gulp.task('fractal:start', ['inheritance', 'svg-sprite', 'sass', 'watch'], () => {
  const server = fractal.web.server({
    sync: true,
    port: 4000
  });
  server.on('error', err => logger.error(err.message));

  return server.start().then(() => {
    logger.success(`Fractal server is now running at ${server.url}`);
  });
});

gulp.task('fractal:build', ['inheritance', 'svg-sprite', 'sass'], () => {
  const builder = fractal.web.builder();

  builder.on('progress', (completed, total) => {
    return logger.update(`Exported ${completed} of ${total} items`, 'info');
  });

  builder.on('error', err => logger.error(err.message));

  return builder.build().then(() => {
    logger.success('Fractal build completed!');
  });
});

// Gulp tasks
gulp.task('watch', () => {
  gulp.watch([
    fractal.components.get('path') + '/**/*.scss',
    fractal.docs.get('path') + '/styles/**/*.scss'
  ], () => {
    runSequence('sass-lint', 'sass', 'css-lint');
  });

  gulp.watch(fractal.components.get('path') + '/**/*.js', () => {
    runSequence('js-lint');
  });

  gulp.watch(fractal.components.get('path') + '/general/icons/files/*.svg', () => {
    runSequence('svg-sprite');
  });
});

gulp.task('sass', () => {
  return gulp.src(fractal.docs.get('path') + '/styles/**/*.scss')
    .pipe(
      gulpif(!util.env.ci,
        plumber({
          errorHandler: notify.onError('Error: <%= error.message %>')
        })
      )
    )
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sassError.gulpSassError(util.env.ci || false)))
    .pipe(sass())
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write('cssmaps'))
    .pipe(gulp.dest(fractal.web.get('static.path') + '/css'));
});

gulp.task('sass-lint', () => {
  return gulp.src(fractal.components.get('path') + '/**/*.scss')
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(gulpif(util.env.ci, sassLint.failOnError()));
});

gulp.task('css-lint', () => {
  return gulp.src(fractal.web.get('static.path') + '/**/*.css')
    .pipe(postcss([
      stylelint(),
      reporter({ throwError: util.env.ci || false })
    ]));
});

gulp.task('js-lint', () => {
  return gulp.src(fractal.components.get('path') + '/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(gulpif(util.env.ci, eslint.failAfterError()));
});

gulp.task('svg-sprite', () => {
  return gulp.src(fractal.components.get('path') + '/general/icons/files/*.svg')
    .pipe(svgSprite({
      mode: {
        symbol: {
          inline: true,
          dest: 'images',
          sprite: 'icons-sprite.svg'
        }
      }
    }))
    .pipe(gulp.dest(fractal.web.get('static.path')));
});

gulp.task('inheritance', () => {
  // Check if configuration file exist
  if (fs.existsSync('./modules.json')) {
    // Remove old build directory
    fs.removeSync('./build');

    // Find all local files
    globby
      .sync([
        fractal.components.get('path') + '/**',
        fractal.docs.get('path') + '/**',
        fractal.web.get('static.path') + '/**'
      ], { nodir: true })
      .forEach(file => {
        // Symlink all local files to build dir
        fs.ensureSymlinkSync(
          file,
          file.replace(__dirname, __dirname + '/build')
        );
      });

    // Read modules configuration file
    const modules = require('./modules.json');

    // Go through array of module paths
    modules.forEach(path => {
      // Find all module files
      path = path.replace(__dirname, '');
      globby
        .sync([
          path + fractal.components.get('path').replace(__dirname, '') + '/**',
          path + fractal.docs.get('path').replace(__dirname, '') + '/**',
          path + fractal.web.get('static.path').replace(__dirname, '') + '/**'
        ], { nodir: true })
        .forEach(file => {
          const srcPath = __dirname + '/' + file,
                destPath = srcPath.replace(path, 'build');

          // Symlink all module files to build dir
          fs.ensureSymlinkSync(srcPath, destPath);
        });
    });

    // Set new paths for Fractal and methods depending on this params
    fractal.components.set('path', __dirname + '/build/components');
    fractal.docs.set('path', __dirname + '/build/docs');
    fractal.web.set('static.path', __dirname + '/build/public');
    fractal.web.set('builder.dest', __dirname + '/build/dest');
  }
});
