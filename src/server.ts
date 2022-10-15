import fastify from 'fastify';
import helmet from '@fastify/helmet';
import fastifySwagger, { SwaggerOptions } from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { TypeBoxTypeProvider, TypeBoxValidatorCompiler } from '@fastify/type-provider-typebox';

import registerRoutes from './routes';
import { EnhancedFastifyInstance } from './types';

export default async function getServer(port = 3000) {
  const app = fastify({
    ignoreTrailingSlash: true,
    logger: {
      level: process.env.LOG_LEVEL || 'info'
    }
  })
    .withTypeProvider<TypeBoxTypeProvider>()
    .setValidatorCompiler(TypeBoxValidatorCompiler);

  // add security headers
  await app.register(helmet);

  // adds open api documentations at /documentation
  if (process.env.DISABLE_DOCS !== 'true') {
    await app.register(fastifySwagger, {
      swagger: {
        info: {
          title: 'Fastify skeleton api',
          version: '1.0.0'
        },
        host: `localhost:${port}`
      },
      exposeRoute: true
    } as SwaggerOptions);
    await app.register(fastifySwaggerUi, {
      routePrefix: '/documentation',
      uiConfig: {
        docExpansion: 'full',
        deepLinking: false
      },
      staticCSP: true
    });
  }

  registerRoutes(app as EnhancedFastifyInstance);

  return app;
}
