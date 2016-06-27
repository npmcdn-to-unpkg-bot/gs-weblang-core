module.exports = {
    grammar: require('../lib/grammar'),
    parser: require('../lib/parser'),
    lexer: require('../lib/lexer'),
    tokens: require('../lib/gobstones-tokens-en'),
    interpreter: require('../lib/interpreter'),
    context: require('../lib/execution-context')
};
