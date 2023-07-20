require('dotenv').config();
const express = require('express');
const app = express();
const port = 3333;
const baseUrl = `http://localhost:${port}`;

const kakaoCallbackUrl = `${baseUrl}/users/auth/kakao/callback`;
const kakaoOauthUrl = 'https://kauth.kakao.com/oauth/authorize';

app.get('/users/auth/kakao', (req, res) => {
  res.redirect(
    `${kakaoOauthUrl}?response_type=code&client_id=${process.env.KAKAO_API_KEY}&redirect_uri=${kakaoCallbackUrl}`,
  );
  res.end();
});

app.get('/users/auth/kakao/callback', (req, res) => {
  res.cookie('token', '000000');
  res.sendStatus(200);
  res.end();
});

app.get('/users/logout', (req, res) => {
  res.clearCookie('token');
  res.end();
});

app.listen(port, () => {
  console.log(`Mock api server running on ${baseUrl}`);
});
