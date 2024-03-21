const PLUGIN_NAME = 'terminfo-src-to-json';
const stream      = new ( require( 'stream' ).Transform )( { objectMode : true } );
const PluginError = require( 'plugin-error' );

stream._transform = function( file, encoding, callback ){
    if( file.isNull() ) return callback( null, file );

    if( file.isStream() ) return callback( new PluginError( PLUGIN_NAME, 'Streaming not supported' ) );

    if( file.isBuffer() ){
        const terminfoJson = require( './terminfo/terminfo-src-to-json.js' )( file.contents.toString( encoding ) );
        
        file.contents = Buffer.from( JSON.stringify( terminfoJson, null, '    ' ) );

        this.push( file );
    };
    callback();
};

const gulp = require('gulp');

gulp.task( 'js', gulp.series(
    function(){
        return gulp.src( [ './terminfo/terminfo-20210816.src' ] )
            .pipe( stream )
            .pipe( gulp.dest( './terminfo/terminfo.json.generated' ) );
    } )
);