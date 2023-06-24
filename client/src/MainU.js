import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Snackbar, Box, Container, Typography, TextField, IconButton, List, ListItem, ListItemText, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'


// 테마 생성
const theme = createTheme()
const EXPRESS_URL = 'https://cytus2testserver.run.goorm.site'

// 메인 화면 컴포넌트
function MainScreen() {
  // 기본 useState 변수
  const [songs, setSongs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState('')
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  
  // 정보 변경 다이얼로그 관련 useState 변수
  const [dialogOpen, setDialogOpen] = useState(false); // 다이얼로그 오픈 여부
  const [dialogMessage, setDialogMessage] = useState('현재 비밀번호를 입력하여 정보수정을 완료하세요.'); // 다이얼로그의 상태 메시지
  const [currentPassword, setCurrentPassword] = useState(''); // 현재 비밀번호
  const [newPassword, setNewPassword] = useState(''); // 바꿀 비밀번호
  const [editEmail, setEditEmail] = useState(user.email); // 바꿀 이메일
  const [editNick, setEditNick] = useState(user.nick); // 바꿀 닉네임
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태변수
  
  const navigate = useNavigate()

  useEffect(() => {
    {/*async/await 을 이용한 비동기 방식구현*/}
    const fetchData = async () => {
      try {
        // 토큰 검증
        const token = localStorage.getItem('token')

        if (token) {
          const response = await fetch(EXPRESS_URL + '/verifyToken', {
            method: 'GET',
            headers: {
              'x-access-token': token
            }
          })
          const userData = await response.json()
          // 유저 정보 저장
          setUser(userData)
          // 만약 유저의 구분이 관리자라면 잘못 들어온 페이지이므로 MainA로 리다이렉트
          if (userData.admin !== 0) {
            window.location.href = '/MainA';
          }
        } else {
          // 문제가 생기면 로그인 페이지로 강제 이동
          window.location.href = '/';
        }
        
        // 출력할 곡 목록 가져오기
        const songResponse = await fetch(EXPRESS_URL + '/api/songs')
        const songsData = await songResponse.json()
        console.log('success get songs list')
        setSongs(songsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])
  
  // 로그아웃 변수의 변화(false->true) 감지용 useEffect
  useEffect(() => {
    if (isLoggedOut) {  
      setTimeout(() => {
        window.location.href = '/'
      }, 2000);
    }
  }, [isLoggedOut]);
  
  // 곡 클릭 
  const handleSongClick = (songID) => {
    navigate(`/SongDetail/${songID}`)
  }
  
  // 로그아웃
  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    setIsLoggedOut(true);
  }

  // 검색
  const highlightText = (text, highlightTerm) => {
    if (!highlightTerm) {
      return text
    }

    const regex = new RegExp(`(${highlightTerm})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {part.toLowerCase() === highlightTerm.toLowerCase() ? (
          <span style={{ backgroundColor: 'yellow' }}>{part}</span>
        ) : (
          part
        )}
      </React.Fragment>
    ))
  }
  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value);
  }
  const filteredSongs = searchTerm
    ? songs.filter(
        (song) =>
          (song.songName && song.songName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (song.songName && song.composer.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : songs;
  
  
  // 설정
  const handleSettingsClick = () => {
    setDialogOpen(true);
    setEditEmail(user.email)
    setEditNick(user.nick)
    setDialogMessage('현재 비밀번호를 입력하여 정보수정을 완료하세요.')
  }
  const handleDialogClose = () => {
    setDialogOpen(false);
  }
  const handleCurrentPasswordChange = (event) => {
    setCurrentPassword(event.target.value)
  }
  const handleNewPasswordChange = (event) => {
    setNewPassword(event.target.value)
  }
  const handleEditEmailChange = (event) => {
    setEditEmail(event.target.value)
  }
  const handleEditNickChange = (event) => {
    setEditNick(event.target.value)
  }
  const handleConfirmClick = async () => {
    try {
      setIsLoading(true);
      
      // 서버에 post 
      const response = await axios.post(EXPRESS_URL + '/api/editUser', {
        userID: user.userID,
        email: editEmail,
        nick: editNick,
        curPassword: currentPassword,
        newPassword: newPassword,
        adminFlag: user.admin // 셀프정보변경의 경우는 그대로일 것
      })
            
      if (response.data.status === 'success'){
        // 변경한 정보대로 현재 로그인된 유저의 정보 있는 토큰 업데이트.
        const token = response.data.token
        localStorage.setItem('token', token);
        const tokenResponse = await fetch(EXPRESS_URL + '/verifyToken', {
          method: 'GET',
          headers: {
            'x-access-token': token
          }
        })
        const userData = await tokenResponse.json()
        setUser(userData)
        console.log('토큰 업데이트 완료:',user)
        
        // 다이얼로그의 변수 초기화, 다이얼로그 닫기
        setEditEmail(user.email)
        setEditNick(user.nick)
        setCurrentPassword('')
        setNewPassword('')
        setDialogMessage('정보가 성공적으로 수정되었습니다(1s)')
        setTimeout(() => { setIsLoading(false); setDialogOpen(false)}, 1000);

      } else{
        // 다이얼로그의 변수 초기화, 다이얼로그 닫기
        setEditEmail(user.email)
        setEditNick(user.nick)
        setCurrentPassword('')
        setNewPassword('')
        setDialogMessage('잘못된 비밀번호를 입력하셨습니다.')
        setTimeout(() => {
          setDialogMessage('현재 비밀번호를 입력하여 정보수정을 완료하세요.') 
          setIsLoading(false); // 로딩 상태 종료
        }, 1000);
      }

      console.log(response.data.status, 'update userinfo')

    } catch (error) {
      console.error(error)
    }
  }
  const isConfirmButtonDisabled = currentPassword === '' // 현재 비밀번호가 비어있으면 확인 버튼 비활성화할 것

  // 엔터 키를 사용해 버튼 클릭을 대신함
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && currentPassword !== '') {
      handleConfirmClick();
    }
  };
  
  
  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mt: 8,
            minHeight: '50vh',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              mb: 2,
            }}
          >
            {/*로그아웃 버튼*/}
            <IconButton onClick={handleLogoutClick}>
              <ExitToAppIcon />
            </IconButton>
            {/*정보변경 버튼*/}
            <IconButton onClick={handleSettingsClick}>
              <SettingsIcon />
            </IconButton>
            {/*유저 닉네임, 아이디 출력*/}
            <Box sx={{ flex: 1, textAlign: 'right' }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: '30px'}}>
                {user.nick}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {user.userID}
              </Typography>
            </Box>
          </Box>
          {/*검색창*/}
          <TextField
            variant="outlined"
            placeholder="검색어를 입력하세요"
            fullWidth
            sx={{ mb: 2 }}
            value={searchTerm}
            onChange={handleSearchInputChange}
          />
          <Box
            sx={{
              flexGrow: 1,
              maxHeight: 'calc(75vh - 56px)',
              overflowY: 'auto',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: filteredSongs.length === 0 ? 'center' : 'flex-start',
            }}
          >
            {/*검색한 내용에 맞게 리스트 수정하여 출력*/}
            {filteredSongs.length === 0 ? (
              <Typography variant="h6">Song Not Found</Typography>
            ) : (
              <List sx={{ width: '100%' }}>
                {filteredSongs.map((song) => (
                  <ListItem
                    key={song.songID}
                    onClick={() => handleSongClick(song.songID)}
                    button
                    sx={{
                      mb: 2,
                      position: 'relative', // 부모 요소에 position: relative 추가
                      overflow: 'hidden',
                      borderRadius: theme.shape.borderRadius,
                      '&::before': {
                        content: "''",
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url(data:image/webp;base64,${song.songImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.3,
                        zIndex: -1, // 배경을 뒤에 위치시키기 위해 z-index 설정
                        transition: 'opacity 0.5s', // 호버 효과에 애니메이션 적용을 위한 트랜지션 설정
                      },
                      '&:hover': {
                        '&::before': {
                          opacity: 0, // 호버 상태일 때 배경의 투명도 0으로 설정
                        },
                      },
                    }}
                  >
                    <ListItemText
                      sx={{
                        '& .MuiTypography-root': {
                          fontWeight: 'bold',
                          textShadow: '1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white',
                        },
                      }}
                      primary={highlightText(song.songName, searchTerm)}
                      secondary={highlightText(song.composer, searchTerm)}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    <Typography variant="caption" sx={{ textShadow: '1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white' }}>
                      {song.releaseDate}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>

        {/* 다이얼로그 */}
        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle>Settings</DialogTitle>
          <DialogContent sx={{ minHeight: '300px' }}>
            <TextField
              label="이메일"
              fullWidth
              value={editEmail}
              onChange={handleEditEmailChange}
              onKeyPress={handleKeyPress}
              sx={{ mb: 2, mt: 1 }}
            />
            <TextField
              label="닉네임"
              fullWidth
              value={editNick}
              onChange={handleEditNickChange}
              onKeyPress={handleKeyPress}
              sx={{ mb: 2 }}
            />
            <TextField
              label="현재 비밀번호"
              fullWidth
              value={currentPassword}
              onChange={handleCurrentPasswordChange}
              onKeyPress={handleKeyPress}
              type="password"
              sx={{ mb: 2 }}
            />
            <TextField
              label="바꿀 비밀번호"
              fullWidth
              value={newPassword}
              onChange={handleNewPasswordChange}
              onKeyPress={handleKeyPress}
              type="password"
              sx={{ mb: 2 }}
            />
            {/*다이얼로그 메시지가 공백일 경우, 아닌 경우 모두 동일한 칸을 차지하도록*/}
            {currentPassword === '' ? (
              <Typography variant="body2" sx={{ color: 'red', userSelect: 'none' }}>
                {dialogMessage}
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ color: 'white', userSelect: 'none' }}>
                {'NULL'}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>취소</Button>
            <Button 
              onClick={handleConfirmClick} 
              disabled={isConfirmButtonDisabled || isLoading}
              >확인
            </Button>
          </DialogActions>
        </Dialog>
        {/*로그아웃 할 때 알림*/}
        <Snackbar
          open={isLoggedOut}
          message="로그아웃되었습니다."
          autoHideDuration={2000} // 2초 후에 자동으로 닫힘
        />
      </Container>
    </ThemeProvider>
  )
}

export default MainScreen
