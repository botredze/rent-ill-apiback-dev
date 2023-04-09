import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerConfigRequest } from './dto';

export const swaggerConfig = ({ appName = 'Project name', port = 3000, apiGuideLink = '' }: SwaggerConfigRequest) =>
    new DocumentBuilder()
        .setDescription(
            `"${appName}" - API documentation.<br><br>Link to <a  target='_blank' href='${apiGuideLink}'>API Guide</a>`
        )
        .setVersion('1.1.1')
        .addServer(`{schema}://${process.env.API_HOST_STAGING}`, 'API Server', {
            schema: { enum: ['https'], default: 'https' },
        })
        .addServer(`{schema}://localhost:${port}`, 'Local API Server', {
            schema: { enum: ['http'], default: 'http' },
        })
        .addSecurity('X_API_KEY', {
            type: 'apiKey',
            name: 'X-API-Key',
            description: 'Application key',
            in: 'header',
        })
        .addSecurity('X_SESSION_KEY', {
            type: 'apiKey',
            name: 'X-Session-Key',
            description: 'Application key',
            in: 'header',
        })
        .addTag('Auth', 'Authentication APIs')
        .addTag('Verification', 'Verification APIs')
        .addTag('User', 'User APIs')
        .addTag('Profile', 'Profile APIs')
        .addTag('Public', 'Public APIs')
        .build();
