module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    // reanimated v4 usa o plugin do worklets; precisa ser o ÚLTIMO
    plugins: ['react-native-worklets/plugin'],
  }
}
