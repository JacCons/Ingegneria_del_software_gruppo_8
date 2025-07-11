import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SecuriTrento API',
    version: '1.0.0',
    description: 'API per la gestione delle segnalazioni di sicurezza',
    contact: {
      name: 'Team 8',
      url: 'https://github.com/JacCons/Ingegneria_del_software_gruppo_8',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {      
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token'
      },
    },
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

const options = {
  swaggerDefinition,
  apis: [
    './routes/*.ts',
    './models/*.ts',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;