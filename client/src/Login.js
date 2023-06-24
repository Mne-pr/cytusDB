import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, Box, Typography, TextField, Button, Link } from '@mui/material';
import axios from 'axios';

// axios 설정
axios.defaults.withCredentials = true;

// 테마 생성 - 큰 의미 없음
const theme = createTheme();

function Login() {
  // 로그인에 사용되는 각종 useState 변수들
  const [idValue, setIdValue] = useState(''); // 아이디
  const [passwordValue, setPasswordValue] = useState(''); // 비밀번호
  const [errorMessage, setErrorMessage] = useState(''); // 에러 메시지
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  const EXPRESS_URL = 'https://cytus2testserver.run.goorm.site';

  // 에러메시지 공백으로 설정
  const clearErrorMessage = () => {
    setErrorMessage('');
  };
  
  // 로그인 화면에 접속할 때 혹시 모를 토큰 삭제 = 자동으로 로그아웃
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      localStorage.removeItem('token');
    }
  }, []);

  const handleIdChange = (e) => {
    setIdValue(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPasswordValue(e.target.value);
  };

  const handleLogin = () => {
    // 잘못 입력받은 경우
    if (idValue === '' || passwordValue === '') {
      setErrorMessage('Please enter both ID and password.'); // 에러 메시지 설정
      setTimeout(clearErrorMessage, 1000);
      return;
    }

    // 로딩 상태 시작
    setIsLoading(true);

    // 서버로 post
    axios
      .post(EXPRESS_URL + '/Login', {
        id: idValue,
        password: passwordValue,
      })
      .then((response) => {
        // 성공
        if (response.data.what === 'success') {
          const token = response.data.token;
          localStorage.setItem('token', token);

          // 토큰은 암호화되어있기 때문에 이를 풀려고 서버로 다시 요청
          fetch(EXPRESS_URL + '/verifyToken', {
            // fetch문 정석, 응답 객체는 Promise 객체로 반환되기 때문에 아래처럼 처리해야
            method: 'GET',
            headers: {
              'x-access-token': token,
            },
          })
            .then((res) => res.json()) // 이 작업이 먼저 진행되어야 data를 확인할 수 있다
            .then((data) => {
              if (data.admin === 0) {
                // 일반유저
                window.location.href = '/MainU';
              }
              if (data.admin === 1) {
                // 관리자유저
                window.location.href = '/MainA';
              }
            })
            .catch((err) => {
              console.error(err);
            });
        } else {
          // 실패
          setErrorMessage(response.data.error); // 에러 메시지 설정
          setTimeout(clearErrorMessage, 1000); // 에러 메시지 시간설정
          setIsLoading(false); // 로딩 상태 종료
        }
      })
      .catch((error) => {
        // 실패
        if (error.response) {
          setErrorMessage(error.response.data.error); // 에러 메시지 설정
          setTimeout(clearErrorMessage, 1000); // 에러 메시지 시간설정
        } else {
          setErrorMessage(error.message); // 에러 메시지 설정
          setTimeout(clearErrorMessage, 1000); // 에러 메시지 시간설정
        }
        setIsLoading(false); // 로딩 상태 종료 = 다이어그램 닫음
      });
  };

  // 엔터 키 입력 시 로그인 작업 수행
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };
  
  // 반환
  return(
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 8,
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom>
            Login
          </Typography>
          <Box sx={{ width: '100%', mb: 2 }}>
            <TextField 
              label="ID" 
              fullWidth placeholder="Enter your ID" 
              value={idValue} 
              onChange={handleIdChange} 
              onKeyPress={handleKeyPress}
            />
          </Box>
          <Box sx={{ width: '100%', mb: 2 }}>
            <TextField
              label="Password"
              fullWidth
              type="password"
              placeholder="Enter your password"
              value={passwordValue}
              onChange={handlePasswordChange}
              onKeyPress={handleKeyPress}
            />
          </Box>
          <Button
            variant="contained"
            color={errorMessage ? 'error' : 'primary'} // 에러가 있으면 버튼 색상을 에러로 변경
            fullWidth
            onClick={handleLogin}
            disabled={isLoading} // 로딩 중이면 버튼 비활성화
          >
            {isLoading ? 'Loading...' : errorMessage ? errorMessage : 'Login'}
          </Button>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Don't have an account? <Link href="/Signup">Sign up</Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default Login;
