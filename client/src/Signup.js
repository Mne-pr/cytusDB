import React, { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Box, Container, Typography, TextField, Button, Link, IconButton } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import axios from 'axios'

const theme = createTheme()

function Signup() {
  // useState 변수들
  const [emailValue, setEmailValue] = useState('') // 이메일
  const [nicknameValue, setNicknameValue] = useState('') // 닉네임
  const [passwordValue, setPasswordValue] = useState('') // 비밀번호
  const [errorMessage, setErrorMessage] = useState(''); // 에러메시지
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  
  const EXPRESS_URL = 'https://cytus2testserver.run.goorm.site'

  const clearErrorMessage = () => {
    setErrorMessage('');
  };
  
  const handleEmailChange = (e) => {
    setEmailValue(e.target.value);
  }
  const handleNicknameChange = (e) => {
    setNicknameValue(e.target.value);
  }
  const handlePasswordChange = (e) => {
    setPasswordValue(e.target.value);
  }
  
  // 뒤로가기 버튼 클릭한 경우
  const goBack = () => {
    window.history.back()
  }

  const handleSignup = () => {
    // 잘못 입력받은 경우
    if (emailValue === "" || nicknameValue === "" || passwordValue === ""){
      setErrorMessage('Please enter All elements'); // 에러 메시지 설정
      setTimeout(clearErrorMessage, 1000);
      return
    }  
    // 서버로 post
    axios.post(EXPRESS_URL + '/Signup', {
      email: emailValue,
      nickname: nicknameValue,
      password: passwordValue
    })
      .then(response => { // 성공
        console.log(response.data.success)
        window.location.href = '/' // 로그인 화면으로 되돌아감
      })
      .catch(error => {   // 실패
        console.error(error)
        setErrorMessage('Please enter both ID and password.'); // 에러 메시지 설정
        setTimeout(clearErrorMessage, 1000); // 메시지 시간 설정
      });
  }
  
  // 엔터 키 입력으로 회원가입 작업 실행
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSignup();
    }
  };

  // 반환
  return (
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
          {/*뒤로가기 버튼*/}
          <IconButton onClick={goBack} sx={{ position: 'absolute', top: 10, left: 10 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h2" gutterBottom>
            Signup
          </Typography>
          <Box sx={{ width: '100%', mb: 2 }}>
            <TextField label="Email" fullWidth placeholder="Enter your email" value={emailValue} onChange={handleEmailChange} onKeyPress={handleKeyPress} />
          </Box>
          <Box sx={{ width: '100%', mb: 2 }}>
            <TextField label="Nickname" fullWidth placeholder="Enter your nickname" value={nicknameValue} onChange={handleNicknameChange} onKeyPress={handleKeyPress} />
          </Box>
          <Box sx={{ width: '100%', mb: 2 }}>
            <TextField label="Password" fullWidth type="password" placeholder="Enter your password" value={passwordValue} onChange={handlePasswordChange} onKeyPress={handleKeyPress} />
          </Box>
          <Button
            variant="contained"
            color={errorMessage ? 'error' : 'primary'} // 에러가 있으면 버튼 색상을 에러로 변경
            fullWidth
            onClick={handleSignup}
            disabled={isLoading} // 로딩 중이면 버튼 비활성화
          >
            {isLoading ? 'Loading...' : errorMessage ? errorMessage : 'Signup'} {/*서버에 요청중일 때 버튼을 비활성화하고 문구교체*/}
          </Button>
          <Box sx={{ mt: 2 }}>
            {/*로그인 화면으로 돌아가는 텍스트*/}
            <Typography variant="body2" color="textSecondary">
              Already have an account? <Link href="/">Login</Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  )
}

export default Signup
