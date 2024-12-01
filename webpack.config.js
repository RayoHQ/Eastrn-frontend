const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.m?js$/,
        include: [
          path.resolve(__dirname, 'node_modules/pdfjs-dist'), // Include pdfjs-dist for Babel processing
          path.resolve(__dirname, 'src'), // Include your source files for Babel processing
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'], // Add necessary presets
            plugins: [
              '@babel/plugin-proposal-private-methods', // Enable private methods
              '@babel/plugin-proposal-class-properties', // Enable class properties
              '@babel/plugin-proposal-optional-chaining', // Enable optional chaining
            ],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Resolve these extensions
  },
};
