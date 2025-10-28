import CopyWebpackPlugin from 'copy-webpack-plugin';
import { resolve } from 'path';

export const plugins = [
    new CopyWebpackPlugin({
        patterns: [
            {
                from: resolve(__dirname, 'src'), // Adjust the path to source root
                to: resolve(__dirname, 'dist'),
                globOptions: {
                    ignore: ['**/*.test.js', '**/*.spec.js'],
                },
                filter: (resourcePath) => resourcePath.endsWith('.hbs'), // Copy only `.hbs` files
            },
        ],
    }),
];
