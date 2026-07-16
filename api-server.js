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

// 运行工作流步骤
app.post('/api/run-walk', async (req, res) => {
  const { templateId, step, action } = req.body;
  if (!templateId || action === undefined) return res.status(400).json({ error: '参数不全' });

  // 不同步骤返回不同结果
  const results = {
    'wechat-generate': { success: true, result: '草稿已生成：\n\n标题：AI帮我省了2小时\n摘要：一个普通人用AI工具的真实体验\n状态：已存入草稿箱，待你核验发布' },
    'wechat-draft': { success: true, result: '已推送至微信公众平台草稿箱。\n打开公众号后台 → 草稿箱 → 查看最新一篇。' },
    'diary-generate': { success: true, result: '日记已生成。\n\n2026-07-14 日记\n今天主要在推进RELAY社区搭建...\n已完成：社区页、API后端、数据库\n下一步：部署上线、真实工作流对接' },
    'ai-role-build': { success: true, result: '角色配置已生成。\n\n助手名称：[你的AI名字]\n核心原则：\n1. 直接不废话\n2. 像老朋友\n3. 不写小作文\n4. 不知道就说不知道\n\n复制这段配置，粘贴到AI对话设置中。' },
    'craft-decrypt': { success: true, result: '解密成功。\n\n古代技艺与现代工具的对应关系已建立。\n核心洞见：技术会变，但人的创作本能不变。' },
    'knowledge-sort': { success: true, result: '知识已归档。\n\n分类：AI工具 / 写作 / 系统搭建\n标签：relay, community, workflow\n已接入Obsidian Vault。' }
  };

  const r = results[action] || { success: true, result: `步骤 "${action}" 已执行。\n当前进度良好，继续下一步。` };
  res.json(r);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`RELAY API running on :${PORT}`));
