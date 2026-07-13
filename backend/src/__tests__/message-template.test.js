import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { MessageTemplate } from '../modules/messageTemplate/models/MessageTemplate.model.js';
import { setupAuth } from './helpers.js';

describe('MessageTemplate Routes', () => {
  let gym, token;

  beforeEach(async () => {
    const ctx = await setupAuth();
    gym = ctx.gym;
    token = ctx.token;
  });

  it('POST /api/v1/message-templates - create template', async () => {
    const res = await request(app)
      .post('/api/v1/message-templates')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ name: 'Welcome', type: 'custom', channel: 'inApp', content: 'Welcome to our gym!' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Welcome');
  });

  it('POST - return 400 on invalid data', async () => {
    const res = await request(app)
      .post('/api/v1/message-templates')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ name: 'X' });
    expect(res.status).toBe(400);
  });

  it('GET /api/v1/message-templates - list templates', async () => {
    await MessageTemplate.create({ gymId: gym._id, name: 'Template A', type: 'custom', channel: 'inApp', content: 'Content A' });
    await MessageTemplate.create({ gymId: gym._id, name: 'Template B', type: 'custom', channel: 'inApp', content: 'Content B' });
    const res = await request(app)
      .get('/api/v1/message-templates')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it('GET /api/v1/message-templates/:id - get by id', async () => {
    const tmpl = await MessageTemplate.create({ gymId: gym._id, name: 'My Template', type: 'custom', channel: 'inApp', content: 'Hello {{name}}' });
    const res = await request(app)
      .get(`/api/v1/message-templates/${tmpl._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('My Template');
  });

  it('PATCH /api/v1/message-templates/:id - update template', async () => {
    const tmpl = await MessageTemplate.create({ gymId: gym._id, name: 'Old', type: 'custom', channel: 'inApp', content: 'Old content' });
    const res = await request(app)
      .patch(`/api/v1/message-templates/${tmpl._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ name: 'Updated', content: 'New content' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });

  it('DELETE /api/v1/message-templates/:id - delete template', async () => {
    const tmpl = await MessageTemplate.create({ gymId: gym._id, name: 'To Delete', type: 'custom', channel: 'inApp', content: 'Delete me' });
    const res = await request(app)
      .delete(`/api/v1/message-templates/${tmpl._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
  });
});
