/* eslint-disable @typescript-eslint/no-explicit-any */
import dotenv from 'dotenv';

dotenv.config();

const env = process.env.NODE_ENV || 'development';

const config: any = {
    development: <any>{
        client: <string>'mysql2',
        connection: <any>{
            host: <string>process.env.DB_HOST,
            port: <string>process.env.DB_PORT,
            user: <string>process.env.DB_USER,
            password: <string>process.env.DB_PASSWORD,
            database: <string>process.env.DB_DATABASE,
        },
        pool: <any>{
            min: <number>2,
            max: <number>10,
        },
        migrations: <any>{
            directory: <string>__dirname + '/src/migrations',
        },
        seeds: <any>{
            directory: <string>__dirname + '/src/seeds',
        },
    },

    staging: <any>{
        client: <string>'mysql2',
        connection: <any>{
            host: <string>process.env.DB_HOST,
            port: <string>process.env.DB_PORT,
            user: <string>process.env.DB_USER,
            password: <string>process.env.DB_PASSWORD,
            database: <string>process.env.DB_DATABASE,
        },
        pool: <any>{
            min: <number>2,
            max: <number>10,
        },
        migrations: <any>{
            directory: <string>__dirname + '/src/migrations',
        },
        seeds: <any>{
            directory: <string>__dirname + '/src/seeds',
        },
    },

    test: <any>{
        client: <string>'mysql2',
        connection: <any>{
            host: <string>process.env.DB_HOST,
            port: <string>process.env.DB_PORT,
            user: <string>process.env.DB_USER,
            password: <string>process.env.DB_PASSWORD,
            database: <string>process.env.DB_DATABASE,
        },
        pool: <any>{
            min: <number>2,
            max: <number>10,
        },
        migrations: <any>{
            directory: <string>__dirname + '/src/migrations',
        },
        seeds: <any>{
            directory: <string>__dirname + '/src/seeds',
        },
    },

    production: <any>{
        client: <string>'mysql2',
        connection: <any>{
            host: <string>process.env.DB_HOST,
            port: <string>process.env.DB_PORT,
            user: <string>process.env.DB_USER,
            password: <string>process.env.DB_PASSWORD,
            database: <string>process.env.DB_DATABASE,
        },
        pool: <any>{
            min: <number>2,
            max: <number>10,
        },
        migrations: <any>{
            directory: <string>__dirname + '/src/migrations',
        },
        seeds: <any>{
            directory: <string>__dirname + '/src/seeds',
        },
    },

    make: <any>{
        client: <string>'mysql2',
        connection: <any>{
            host: <string>process.env.DB_HOST,
            port: <string>process.env.DB_PORT,
            user: <string>process.env.DB_USER,
            password: <string>process.env.DB_PASSWORD,
            database: <string>process.env.DB_DATABASE,
        },
        pool: <any>{
            min: <number>2,
            max: <number>10,
        },
        migrations: <any>{
            directory: <string>__dirname + '/src/migrations',
        },
        seeds: <any>{
            directory: <string>__dirname + '/src/seeds',
        },
    },
};

export default config[env];
