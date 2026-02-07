
import { extendTheme } from 'native-base';

export const theme = extendTheme({
    colors: {
        // Alignment with Ant Design / PC 4.0 Blue
        brand: {
            50: '#e6f7ff',
            100: '#bae7ff',
            200: '#91d5ff',
            300: '#69c0ff',
            400: '#40a9ff',
            500: '#1890ff', // Primary Blue
            600: '#096dd9',
            700: '#0050b3',
            800: '#003a8c',
            900: '#002766',
        },
        business: {
            gray: '#f0f2f5', // PC 4.0 background
            border: '#f0f0f0',
            textTitle: '#262626',
            textSecondary: '#8c8c8c',
        }
    },
    components: {
        Heading: {
            baseStyle: {
                color: 'business.textTitle',
                fontWeight: '600',
            }
        },
        Button: {
            baseStyle: {
                rounded: '2px', // Ant Design style is less rounded
            },
            defaultProps: {
                colorScheme: 'brand',
            }
        },
        Input: {
            baseStyle: {
                rounded: '2px',
                borderColor: 'business.border',
            }
        }
    },
    config: {
        initialColorMode: 'light',
    },
});
