module.exports = function(api) {
    api.cache(true);
  
    const presets = [
      ['@babel/preset-env', { targets: { node: 'current' } }]
    ];
    const plugins = [
      ['module-resolver',
        {
          root: ['./'],
          alias: {
            test: './test',
            'nacelle-connector': './src',
            'connector-config': './config'
          }
        }
      ]
    ];
  
    return {
      presets,
      plugins
    };
  }