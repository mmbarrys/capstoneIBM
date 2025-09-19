module.exports = function override(config, env) {
  // Filter out source-map-loader
  config.module.rules = config.module.rules.map(rule => {
    if (rule.oneOf) {
      rule.oneOf = rule.oneOf.filter(innerRule =>
        !(innerRule.loader && innerRule.loader.includes('source-map-loader'))
      );
    }
    return rule;
  });

  return config;
};
