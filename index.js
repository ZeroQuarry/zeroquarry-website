// Live agent debate simulation shown in the hero console.
(function () {
  const body = document.getElementById('body');
  const verdict = document.getElementById('verdict');
  if (!body || !verdict) return;

  const script = [
    { who: 'sys',  name: 'SYSTEM', ts: '14:02:01', text: 'session opened · target: <span class="k">auth-svc/middleware/jwt.ts</span>' },
    { who: 'red',  name: 'RED',    ts: '14:02:03', text: 'scanning signature-verification path…' },
    { who: 'red',  name: 'RED',    ts: '14:02:07', text: 'observed: verifier accepts <span class="k">HS256</span> + <span class="k">RS256</span> with the same key param.' },
    { who: 'red',  name: 'RED',    ts: '14:02:09', text: 'hypothesis: <span class="f">algorithm confusion</span>. sign HS256 with public key as HMAC secret.' },
    { who: 'blue', name: 'VENDOR', ts: '14:02:12', text: 'skepticism: public key may not be reachable by attacker. Prove it.' },
    { who: 'red',  name: 'RED',    ts: '14:02:14', text: 'GET <span class="b">/.well-known/jwks.json</span> → <span class="g">200</span> · key <span class="k">exposed</span>.' },
    { who: 'red',  name: 'RED',    ts: '14:02:17', text: 'forging token: <span class="m">eyJhbGciOi…HS256.[admin].[sig]</span>' },
    { who: 'red',  name: 'RED',    ts: '14:02:18', text: 'POST <span class="b">/api/account</span> → <span class="g">200 OK</span> · role=<span class="f">admin</span>' },
    { who: 'blue', name: 'VENDOR', ts: '14:02:20', text: 'reproduced in staging. conceding vulnerability.' },
    { who: 'blue', name: 'VENDOR', ts: '14:02:21', text: 'proposed patch: restrict <span class="k">algorithms</span> to <span class="k">["RS256"]</span> explicitly.' },
    { who: 'good', name: 'VERDICT', ts: '14:02:24', text: '<span class="g">CONFIRMED</span> · severity <span class="f">critical</span> · patch drafted · report <span class="k">ZQ-2042</span>' },
  ];

  function addLine(entry) {
    const row = document.createElement('div');
    row.className = 'line ' + entry.who;
    row.innerHTML = `
      <div class="ts">${entry.ts}</div>
      <div class="agent">${entry.name}</div>
      <div class="msg typing"></div>`;
    body.appendChild(row);
    const msg = row.querySelector('.msg');

    return new Promise(resolve => {
      const raw = entry.text;
      let i = 0;
      const step = () => {
        let next = i + 2 + Math.floor(Math.random() * 3);
        while (i < raw.length) {
          if (raw[i] === '<') {
            const close = raw.indexOf('>', i);
            if (close !== -1) { i = close + 1; continue; }
          }
          break;
        }
        if (next > raw.length) next = raw.length;
        msg.innerHTML = raw.slice(0, next);
        i = next;
        if (i < raw.length) {
          setTimeout(step, 8 + Math.random() * 14);
        } else {
          msg.classList.remove('typing');
          body.scrollTop = body.scrollHeight;
          resolve();
        }
      };
      step();
    });
  }

  async function run() {
    while (true) {
      body.innerHTML = '';
      verdict.textContent = 'awaiting verdict…';
      for (const entry of script) {
        await addLine(entry);
        await new Promise(r => setTimeout(r, 350 + Math.random() * 450));
        if (entry.who === 'good') {
          verdict.innerHTML = '<span class="verdict-good">● VERDICT: CONFIRMED</span> · ZQ-2042 drafted';
        }
      }
      await new Promise(r => setTimeout(r, 4000));
    }
  }
  run();
})();
