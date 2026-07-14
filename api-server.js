const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const FEISHU = {
  app_id: process.env.FEISHU_APP_ID || '',
  app_secret: process.env.FEISHU_SECRET || ''
};

const BITABLE = {
  app_token: process.env.BITABLE_TOKEN || 'TSnkb204na1n39sL2iacbpf0nbe',
  table_id: 'tbl4zh8ZnJBjECkT'
};

async function getToken() {
  if (!FEISHU.app_id || !FEISHU.app_secret) {
    throw new Error('Feishu credentials not configured');
  }
  const r = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(FEISHU)
  }).then(r => r.json());
  return r.tenant_access_token;
}

app.post('/api/submit', async (req, res) => {
  try {
    const token = await getToken();
    const { title, direction, type, summary, content, author } = req.body;
    if (!title) return res.status(400).json({ error: '标题必填' });
    const r = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${BITABLE.app_token}/tables/${BITABLE.table_id}/records`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: { title, direction: direction || '其他', type: type || '工作流', summary: (summary || '').slice(0, 200), content: content || '', author: author || '匿名', status: 'pending' }
      })
    }).then(r => r.json());
    res.json({ success: true, data: r });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/templates', async (req, res) => {
  try {
    const token = await getToken();
    const r = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${BITABLE.app_token}/tables/${BITABLE.table_id}/records?page_size=50`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    const items = (r.data?.items || []).map(rec => ({
      id: rec.record_id,
      title: rec.fields.title || '',
      direction: rec.fields.direction || '',
      type: rec.fields.type || '',
      summary: rec.fields.summary || '',
      author: rec.fields.author || '匿名',
      status: rec.fields.status || 'pending',
      date: rec.fields['创建时间'] || rec.fields['更新时间'] || '',
      likes: rec.fields.likes || 0,
      runs: rec.fields.runs || 0
    }));
    res.json({ success: true, total: items.length, items });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/like', async (req, res) => {
  try {
    const token = await getToken();
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id必填' });
    const get = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${BITABLE.app_token}/tables/${BITABLE.table_id}/records/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    const current = get.data?.record?.fields?.likes || 0;
    await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${BITABLE.app_token}/tables/${BITABLE.table_id}/records/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { likes: current + 1 } })
    });
    res.json({ success: true, likes: current + 1 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/run', async (req, res) => {
  try {
    const token = await getToken();
    const { id } = req.body;
    const get = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${BITABLE.app_token}/tables/${BITABLE.table_id}/records/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    const current = get.data?.record?.fields?.runs || 0;
    await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${BITABLE.app_token}/tables/${BITABLE.table_id}/records/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { runs: current + 1 } })
    });
    res.json({ success: true, runs: current + 1 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`RELAY API running on :${PORT}`));
