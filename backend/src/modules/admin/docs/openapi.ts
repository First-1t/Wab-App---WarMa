import {
  ALL_KNOWN_CROPS,
  SUPPORTED_SEASONS,
  WATER_CONDITIONS,
} from '../../../shared/contracts/scenario.contracts.js';

const json = (schema: object) => ({ 'application/json': { schema } });
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const dataOf = (schema: object) => ({
  type: 'object',
  properties: { success: { type: 'boolean', example: true }, data: schema },
});
const ok = (description: string, schema: object) => ({
  description,
  content: json(dataOf(schema)),
});
const error = (description: string) => ({ description, content: json(ref('Error')) });
const signedIn = [{ bearerAuth: [] }];
const needLogin = { 401: error('ไม่ได้ล็อกอิน หรือเซสชันหมดอายุ') };
const scenarioId = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string' },
  example: 'SCN-1a2b3c4d',
};

/** เอกสาร OpenAPI ของ Admin API — เปิดดูได้ที่ /api/admin/docs */
export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'WarMa Admin API',
    version: '1.0.0',
    description:
      'จัดการข้อมูลสถานการณ์จำลอง (Scenario) และความคิดเห็นของผู้ใช้ ' +
      'เส้นทางที่มีรูปกุญแจต้องส่ง JWT จาก POST /auth/login ใน header Authorization: Bearer',
  },
  servers: [
    { url: 'https://warma-api.onrender.com/api/admin', description: 'Production' },
    { url: 'http://localhost:5000/api/admin', description: 'Local' },
  ],
  tags: [
    { name: 'Auth', description: 'ล็อกอินด้วยอีเมลมหาวิทยาลัยผ่าน Google' },
    { name: 'Scenarios', description: 'แก้ไขข้อมูลที่ Output ใช้จับคู่คำแนะนำ' },
    { name: 'Feedback', description: 'ความคิดเห็นและการแจ้งเตือนทางอีเมล' },
  ],
  paths: {
    '/auth/config': {
      get: {
        tags: ['Auth'],
        summary: 'ค่าที่หน้าเว็บใช้แสดงปุ่มล็อกอิน',
        responses: { 200: ok('สำเร็จ', ref('AuthConfig')) },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'แลก Google ID token เป็น JWT อายุ 8 ชั่วโมง',
        description: 'จำกัด 10 ครั้งต่อนาที',
        requestBody: {
          required: true,
          content: json({
            type: 'object',
            required: ['credential'],
            properties: { credential: { type: 'string', description: 'Google ID token' } },
          }),
        },
        responses: {
          200: ok('ล็อกอินสำเร็จ', {
            type: 'object',
            properties: { token: { type: 'string' }, user: ref('AdminUser') },
          }),
          400: error('ไม่ได้ส่ง credential'),
          401: error('Google ยืนยันไม่ผ่าน หรือไม่ใช่อีเมลมหาวิทยาลัย'),
          429: error('ลองล็อกอินถี่เกินไป'),
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'ข้อมูลผู้ที่ล็อกอินอยู่',
        security: signedIn,
        responses: { 200: ok('สำเร็จ', ref('AdminUser')), ...needLogin },
      },
    },
    '/scenarios': {
      get: {
        tags: ['Scenarios'],
        summary: 'รายการสถานการณ์จำลองและตัวเลือกที่ใช้ได้',
        security: signedIn,
        responses: {
          200: {
            description: 'สำเร็จ',
            content: json({
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: { type: 'array', items: ref('Scenario') },
                options: ref('ScenarioOptions'),
              },
            }),
          },
          ...needLogin,
        },
      },
      post: {
        tags: ['Scenarios'],
        summary: 'เพิ่มสถานการณ์จำลอง',
        security: signedIn,
        requestBody: { required: true, content: json(ref('ScenarioInput')) },
        responses: {
          201: ok('เพิ่มสำเร็จ', ref('Scenario')),
          400: error('ข้อมูลไม่ถูกต้อง'),
          ...needLogin,
          409: error('พันธุ์ ฤดูปลูก และสถานะน้ำซ้ำกับชุดที่มีอยู่'),
        },
      },
    },
    '/scenarios/{id}': {
      put: {
        tags: ['Scenarios'],
        summary: 'แก้ไขสถานการณ์จำลอง',
        security: signedIn,
        parameters: [scenarioId],
        requestBody: { required: true, content: json(ref('ScenarioInput')) },
        responses: {
          200: ok('แก้ไขสำเร็จ', ref('Scenario')),
          400: error('ข้อมูลไม่ถูกต้อง'),
          ...needLogin,
          404: error('ไม่พบข้อมูลชุดนี้'),
          409: error('พันธุ์ ฤดูปลูก และสถานะน้ำซ้ำกับชุดที่มีอยู่'),
        },
      },
      delete: {
        tags: ['Scenarios'],
        summary: 'ลบสถานการณ์จำลอง',
        security: signedIn,
        parameters: [scenarioId],
        responses: {
          200: {
            description: 'ลบสำเร็จ',
            content: json({
              type: 'object',
              properties: { success: { type: 'boolean', example: true } },
            }),
          },
          ...needLogin,
          404: error('ไม่พบข้อมูลชุดนี้'),
        },
      },
    },
    '/feedback': {
      post: {
        tags: ['Feedback'],
        summary: 'ส่งคะแนนและความคิดเห็น (ไม่ต้องล็อกอิน)',
        description: 'จำกัด 5 ครั้งต่อนาที',
        requestBody: {
          required: true,
          content: json({
            type: 'object',
            required: ['rating'],
            properties: {
              rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
              comment: { type: 'string', maxLength: 1000, example: 'ใช้งานง่าย' },
              page: { type: 'string', example: '/output' },
            },
          }),
        },
        responses: {
          201: ok('บันทึกสำเร็จ', ref('Feedback')),
          400: error('คะแนนหรือความคิดเห็นไม่ถูกต้อง'),
          429: error('ส่งถี่เกินไป'),
        },
      },
      get: {
        tags: ['Feedback'],
        summary: 'สรุปคะแนนและความคิดเห็นทั้งหมด',
        security: signedIn,
        responses: { 200: ok('สำเร็จ', ref('FeedbackSummary')), ...needLogin },
      },
    },
    '/feedback/notify': {
      get: {
        tags: ['Feedback'],
        summary: 'สถานะการรับแจ้งเตือนทางอีเมล',
        security: signedIn,
        responses: { 200: ok('สำเร็จ', ref('NotifyStatus')), ...needLogin },
      },
      put: {
        tags: ['Feedback'],
        summary: 'เปิดหรือปิดการรับแจ้งเตือนทางอีเมล',
        security: signedIn,
        requestBody: {
          required: true,
          content: json({
            type: 'object',
            required: ['subscribed'],
            properties: { subscribed: { type: 'boolean' } },
          }),
        },
        responses: {
          200: ok('สำเร็จ', ref('NotifyStatus')),
          400: error('subscribed ไม่ถูกต้อง'),
          ...needLogin,
        },
      },
    },
    '/feedback/notify/test': {
      post: {
        tags: ['Feedback'],
        summary: 'ส่งอีเมลทดสอบถึงผู้ที่ล็อกอิน',
        description: 'จำกัด 3 ครั้งต่อนาที',
        security: signedIn,
        responses: {
          200: ok('ส่งสำเร็จ', {
            type: 'object',
            properties: { sent: { type: 'boolean' }, to: { type: 'string' } },
          }),
          400: error('เซิร์ฟเวอร์ยังไม่ได้ตั้งค่าการส่งอีเมล'),
          ...needLogin,
          429: error('ส่งถี่เกินไป'),
          502: error('ส่งอีเมลไม่สำเร็จ'),
        },
      },
    },
  },
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          details: { type: 'array', items: { type: 'string' } },
        },
      },
      AdminUser: {
        type: 'object',
        properties: {
          email: { type: 'string', example: 'name@kkumail.com' },
          name: { type: 'string' },
          picture: { type: 'string' },
        },
      },
      AuthConfig: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          clientId: { type: 'string' },
          domains: {
            type: 'array',
            items: { type: 'string' },
            example: ['kku.ac.th', 'kkumail.com'],
          },
        },
      },
      ScenarioOptions: {
        type: 'object',
        properties: {
          crops: { type: 'array', items: { type: 'string' }, example: ALL_KNOWN_CROPS },
          seasons: { type: 'array', items: { type: 'string' }, example: SUPPORTED_SEASONS },
          waterConditions: { type: 'array', items: { type: 'string' }, example: WATER_CONDITIONS },
        },
      },
      ScenarioInput: {
        type: 'object',
        required: [
          'name',
          'crop',
          'plantingSeason',
          'waterCondition',
          'waterPerRaiM3',
          'waterRequirementM3',
          'dryYieldKgPerRai',
          'freshYield',
          'risk',
          'advice',
          'schedule',
        ],
        properties: {
          name: { type: 'string', maxLength: 200 },
          crop: { type: 'string', enum: ALL_KNOWN_CROPS },
          plantingSeason: { type: 'string', enum: SUPPORTED_SEASONS },
          waterCondition: { type: 'string', enum: WATER_CONDITIONS },
          waterPerRaiM3: { type: 'number', minimum: 0 },
          waterRequirementM3: { type: 'number', exclusiveMinimum: true, minimum: 0 },
          dryYieldKgPerRai: { type: 'number', minimum: 0 },
          freshYield: {
            type: 'object',
            required: ['minKgPerRai', 'maxKgPerRai', 'avgTonsPerRai', 'estimatedStarchPercent'],
            properties: {
              minKgPerRai: { type: 'number', minimum: 0 },
              maxKgPerRai: { type: 'number', minimum: 0 },
              avgTonsPerRai: { type: 'number', minimum: 0 },
              estimatedStarchPercent: { type: 'number', minimum: 0, maximum: 100 },
            },
          },
          risk: { type: 'string', enum: ['ต่ำ', 'ปานกลาง', 'สูง'] },
          advice: { type: 'array', maxItems: 30, items: { type: 'string', maxLength: 500 } },
          schedule: {
            type: 'array',
            minItems: 1,
            maxItems: 20,
            items: {
              type: 'object',
              required: ['phase', 'management', 'freq', 'amountPerRaiM3'],
              properties: {
                phase: { type: 'string', maxLength: 200 },
                management: { type: 'string' },
                freq: { type: 'string' },
                amountPerRaiM3: { type: 'number', minimum: 0 },
              },
            },
          },
          isMockData: { type: 'boolean', default: true },
          note: { type: 'string' },
        },
      },
      Scenario: {
        allOf: [
          ref('ScenarioInput'),
          {
            type: 'object',
            description: 'ระบบกำหนด id และช่วง ratio ให้เอง',
            properties: {
              id: { type: 'string', example: 'SCN-1a2b3c4d' },
              minRatio: { type: 'number' },
              maxRatio: { type: 'number' },
            },
          },
        ],
      },
      Feedback: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          comment: { type: 'string', nullable: true },
          email: { type: 'string', nullable: true },
          page: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      FeedbackSummary: {
        type: 'object',
        properties: {
          count: { type: 'integer' },
          average: { type: 'number', nullable: true },
          distribution: {
            type: 'array',
            description: 'จำนวนคนที่ให้ 1 ถึง 5 ดาว',
            items: { type: 'integer' },
          },
          items: { type: 'array', items: ref('Feedback') },
        },
      },
      NotifyStatus: {
        type: 'object',
        properties: {
          mailEnabled: { type: 'boolean' },
          email: { type: 'string', nullable: true },
          subscribed: { type: 'boolean' },
          subscribers: { type: 'integer' },
        },
      },
    },
  },
};
