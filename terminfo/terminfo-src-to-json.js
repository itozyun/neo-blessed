/**
 * 名前一覧と各端末の json を作る
 *  1. terminalNames.json
 *  2. vt100,json
 */

const Variables = require( '../lib/alias.js' );

const __SKIP__ = '__skip__';
const skipVariables = {
    AX : true, rmxx : true, smxx : true, U8 : true, E3 : true, grbom : true, gsbom : true, OTpt : true,
    ka2 : true, kb1 : true, kb3 : true, kc2 : true, kLFT5 : true, kRIT5 : true, kDC5 : true, kLFT3 : true,
    kRIT3 : true, kEND5 : true, kHOM5 : true, kDN3 : true, kDN4 : true, kDN5 : true, kDN6 : true, kEND3 : true, kEND4 : true,
    kEND6 : true, kEND7 : true, kEND8 : true, kHOM3 : true, kHOM4 : true, kHOM6 : true, kHOM7 : true, kHOM8 : true,
    kLFT4 : true, kLFT6 : true, kNXT3 : true, kPRV3 : true, kRIT4 : true, kRIT6 : true, kUP3 : true, kUP4 : true, kUP5 : true,
    kUP6 : true, kp1 : true, kp2 : true, kp3 : true, kp4 : true, kp5 : true, kp6 : true, kp7 : true, kp8 : true, kp9 : true,
    kpADD : true, kpDIV : true, kpDOT : true, kpMUL : true, kpNUM : true, kpSUB : true, kpZRO : true,
    setal : true, Rmol : true, Smol : true, Smulx : true, blink2 : true, norm : true, opaq : true, smul2 : true,
    meml : true, memu : true, kDN : true, kDN7 : true, kLFT7 : true, kRIT7 : true, kUP : true, kUP7 : true, kDC3 : true,
    kDC4 : true, kDC6 : true, kDC7 : true, kIC3 : true, kIC4 : true, kIC5 : true, kIC6 : true, kIC7 : true,
    kNXT4 : true, kNXT5 : true, kNXT6 : true, kNXT7 : true, kPRV4 : true, kPRV5 : true, kPRV6 : true, kPRV7 : true,
    kpCMA : true, RGB : true, CO : true, Cs : true, Ms : true, Se : true, Ss : true, TS : true, XM : true, xm : true
};

function findVariableName( variableNames, variableName ){
    if( skipVariables[ variableName ] ) return __SKIP__;

    for( var k in variableNames ){
        if( variableNames[ k ][ 0 ] === variableName ){
            return k;
        };
    };
    variableName = variableName.toLowerCase();
    for( var k in variableNames ){
        if( variableNames[ k ][ 0 ] === variableName ){
            return k;
        };
    };
};

function cleanupSpace( string ){
    if( string[ 0 ] === '\t' ){
        string = string.substr( 1 );
    };
    while( string[ 0 ] === ' ' ){
        string = string.substr( 1 );
    };
    while( string[ 0 ] === '.' ){
        console.log( 'I remove dot at ' + string );
        string = string.substr( 1 );
    };
    while( string[ string.length - 1 ] === ' ' ){
        string = string.substr( 0, string.length - 1 );
    };
    return string;
};

function splitCapabilites( str ){
    const lines = [];

    for( var i = 0, start = 0, l = str.length; i < l; ++i ){
        if( i === l - 1 || str[ i ] === ',' && str[ i - 1 ] !== '\\' ){
            lines.push( str.substring( start, i ) );
            start = i + 1;
        };
    };
    return lines;
};

/**
 * @param {string} _terminfoSource 
 */
module.exports = function( _terminfoSource ){
    const terminalInfoObject = {},
          terminfoSource     = _terminfoSource.split( '\n' ),
          l = terminfoSource.length;

    for( let lineNumber = 0, currentTerminal, multiLines = ''; lineNumber < l; ++lineNumber ){
        let line = terminfoSource[ lineNumber ];

        if( !line || line[ 0 ] === '#' ){
            if( multiLines ){
                throw 'Multi line value error! @' + lineNumber;
            };
            currentTerminal = null;
            continue;
        };
        if( line[ 0 ] !== '\t' ){
            const terminalNames = line.split( '|' );
            if( 2 <= terminalNames.length ){
                const primaryName = terminalNames.shift();
                const description = terminalNames.pop().split( ',' )[ 0 ];
                currentTerminal = terminalInfoObject[ primaryName ] = {
                    desc : description,
                    caps : {}
                };
                if( terminalNames.length ){
                    currentTerminal.alias = terminalNames;
                };
            } else {
                throw 'Bad terminal name! ' + line + ' @' + lineNumber;
            };
        } else {
            if( !currentTerminal ){
                throw 'No terminal name! @' + lineNumber;
            };
            line = cleanupSpace( line );
            if( line[ line.length - 1 ] === ',' ){
                registerCapabilites( splitCapabilites( multiLines + line ), currentTerminal, lineNumber );
                multiLines = '';
            } else {
                multiLines += line;
            };
        };
    };

    function registerCapabilites( capabilites, currentTerminal, lineNumber ){
        for( let i = 0, l = capabilites.length; i < l; ++i ){
            const capability = cleanupSpace( capabilites[ i ] );

            if( capability ){
                let variable, value;

                if( capability[ capability.length - 1 ] === '@' ){
                    currentTerminal.cancel = currentTerminal.cancel || [];
                    currentTerminal.cancel.push( capability.substr( 0, capability.length - 2 ) );
                } else if( capability.substr( 0, 4 ) === 'use=' ){
                    useTerminalInfo( capability.split( '=' )[ 1 ], currentTerminal, lineNumber );
                    continue;
                } else if( variable = findVariableName( Variables.bools, capability ) ){
                    value = true;
                } else if( variable = findVariableName( Variables.numbers, capability.split( '#' )[ 0 ] ) ){
                    value = Number( capability.split( '#' )[ 1 ] );
                    if( !isFinite( value ) ){
                        throw 'Invalid numeric value! "' + capability + '" @' + lineNumber;
                    };
                } else if( variable = findVariableName( Variables.strings, capability.split( '=' )[ 0 ] ) ){
                    value = capability.split( '=' )[ 1 ];
                } else {
                    throw 'Unknown terminfo capability! "' + capability + '" @' + lineNumber;
                };
                if( __SKIP__ !== variable ){
                    currentTerminal.caps[ variable ] = value;
                };
            };
        };
    };

    function useTerminalInfo( useTerminalName, currentTerminal, lineNumber ){
        var refeancedTerminfo = terminalInfoObject[ useTerminalName ];
        
        if( refeancedTerminfo ){
            for( let variableName in refeancedTerminfo.caps ){
                if( currentTerminal.caps[ variableName ] === undefined ){
                    currentTerminal.caps[ variableName ] = refeancedTerminfo.caps[ variableName ];
                } else if( currentTerminal.caps[ variableName ] === refeancedTerminfo.caps[ variableName ] ){

                } else {
                    // console.dir( terminalInfoObject )
                    // console.log( 'Override ' + currentTerminal.caps[ variableName ] + ' => ' + refeancedTerminfo.caps[ variableName ] + ' ' + useTerminalName + '" @' + lineNumber );
                    currentTerminal.caps[ variableName ] = refeancedTerminfo.caps[ variableName ];
                    // throw 'Variable already defined! "' + variableName + '" in "' + useTerminalName + '" @' + lineNumber;
                };
            };
        } else {
            currentTerminal.use = currentTerminal.use || [];
            currentTerminal.use.push( useTerminalName );
            // throw 'Terminfo not found! "' + useTerminalName + '" @' + lineNumber;
        };
    };

    return terminalInfoObject;
};