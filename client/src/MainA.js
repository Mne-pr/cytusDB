import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Snackbar, Box, Container, Typography, TextField, List, ListItem, ListItemText, Button, IconButton, ListItemButton, ToggleButton, ToggleButtonGroup, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import SettingsIcon from '@mui/icons-material/Settings'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'

// 테마 생성
const theme = createTheme()
const EXPRESS_URL = 'https://cytus2testserver.run.goorm.site'

// 메인 화면 컴포넌트
function MainScreen() {
  // 일반 useState 변수
  const [songs, setSongs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState('')
  const [users, setUsers] = useState([])
  const [showUsers, setShowUsers] = useState(false)
  const [isLoggedOut, setIsLoggedOut] = useState(false);
 
  // 로딩 상태 관련 useState 변수
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태  
  const [dialogMessage, setDialogMessage] = useState(''); // 상태에 따른 메시지
  
  // 곡 추가 관련 useState 변수
  const [showAddSong, setShowAddSong] = useState(false)
  const [hoveredSong, setHoveredSong] = useState(null)
  const [addSongData, setAddSongData] = useState({
    songName: '',
    composer: '',
    releaseDate: '',
    difficulty:'',
    selectedImage: null,
    selectedImageUrl: null
  })
  
  // 다이얼로그 관련 useState 변수
  const [showEditSong, setShowEditSong] = useState(false)
  const [editSongData, setEditSongData] = useState({
    songName: '',
    composer: '',
    releaseDate: '',
    difficulty: ''
  })
  const [editSongId, setEditSongId] = useState('')
  
  const navigate = useNavigate()

  // 처음 접속할 때
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 토큰 검증
        const token = localStorage.getItem('token');

        if (token) {
          const response = await fetch(EXPRESS_URL + '/verifyToken', {
            method: 'GET',
            headers: {
              'x-access-token': token,
            },
          });
          const userData = await response.json();
          // 유저 정보 저장
          setUser(userData)
          // 유저의 구분이 일반유저인 경우 잘못 들어온 페이지이므로 MainU로 이동
          if (userData.admin !== 1) {
            window.location.href = '/MainU';
          }
        } else {
          // 로그인 페이지로 강제 이동
          window.location.href = '/';
        }
        
        // 곡 목록 가져오기
        const songResponse = await fetch(EXPRESS_URL + '/api/songs');
        const songsData = await songResponse.json();
        console.log('success get songs list');
        setSongs(songsData);
        
        // 유저 목록 가져오기
        const userResponse = await fetch(EXPRESS_URL + '/api/users');
        const usersData = await userResponse.json();
        console.log('success get users list');
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [])

  // 로그아웃 변수의 변화(false->true) 감지용 useEffect
  useEffect(() => {
    if (isLoggedOut) {  
      setTimeout(() => {
        window.location.href = '/'
      }, 2000);
    }
  }, [isLoggedOut]);
  
  // 곡 클릭 - 원래 관리자 계정은 플레이 데이터를 가지지 않도록 할 것이므로 임시기능인 것
  const handleSongClick = (songID) => {
    // 해당 곡의 페이지로 이동
    navigate(`/SongDetail/${songID}`)
  }
  // 유저 클릭
  const handleUserClick = (userID) => {
    // 해당 유저의 페이지로 이동
    navigate(`/UserDetail/${userID}`)
  }
  
  // 검색 관련
  const highlightText = (text, highlightTerm) => {
    if (!highlightTerm) {
      return text;
    }

    const regex = new RegExp(`(${highlightTerm})`, 'gi');
    return text.split(regex).map((part, index) => (
      <React.Fragment key={index}>
        {part.toLowerCase() === highlightTerm.toLowerCase() ? (
          <span style={{ backgroundColor: 'yellow' }}>{part}</span>
        ) : (
          part
        )}
      </React.Fragment>
    ));
  }
  const handleSearchInputChange = (event) => {
    const input = event.target.value;
    setSearchTerm(input.toLowerCase());
  }
  const filteredSongs = searchTerm
    ? songs.filter(
        (song) =>
          (song.songName && song.songName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (song.songName && song.composer.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : songs
  const filteredUsers = searchTerm
    ? users.filter(
        (user) =>
          (user.nick && user.nick.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.userID && user.userID.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : users
  
  // 토글버튼
  const handleToggle = () => {
    setShowUsers((prevShowUsers) => !prevShowUsers);
    setShowAddSong(false);
    setSearchTerm('');
  }
  
  // 로그아웃
  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    setIsLoggedOut(true);
  }

  // 곡 삽입 
  const handleAddSong = () => {
    setDialogMessage('모든 정보를 입력하여 곡을 추가하세요.')
    setShowAddSong(true);
  }
  const handleAddSongDialogClose = () => {
    setIsLoading(false); 
    setShowAddSong(false)
    setAddSongData({
      songName: '',
      composer: '',
      releaseDate: '',
      difficulty:'',
      selectedImage: null,
      selectedImageUrl: null
    })
  }
  const handleAddSongInputChange = (event) => {
    const { name, value } = event.target;
    setAddSongData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }
  // 다이어로그에서 이미지 선택 -> 미리보기 지정
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    setAddSongData((prevData) => ({
      ...prevData,
      selectedImageUrl: imageUrl,
      selectedImage: file
    }));
  }
  // DB 서버로 다이어로그에 적힌 내용 추가요청
  const handleAddSongSubmit = async () => {
    try {
      setIsLoading(true);
      
      // 대략 3초 걸리길래 이렇게 메시지 설정
      setDialogMessage('곡이 추가되었습니다(3s)')
      
      const formData = new FormData();
      formData.append('songName', addSongData.songName);
      formData.append('composer', addSongData.composer);
      formData.append('releaseDate', addSongData.releaseDate);
      formData.append('difficulty', addSongData.difficulty);
      formData.append('songImage', addSongData.selectedImage);

      await axios.post(EXPRESS_URL + '/api/addSong', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Song added successfully');
      setTimeout(() => {handleAddSongDialogClose();}, 1000)
      
      // 곡 목록 가져오기
      const songResponse = await fetch(EXPRESS_URL + '/api/songs');
      const songsData = await songResponse.json();
      console.log('success get songs list');
      setSongs(songsData);
    } catch (error) {
      setIsLoading(false);
      console.error('Error adding song:', error);
    }
  }
  
  // 곡 삭제 
  const handleSongMouseEnter = (songID) => {
    setHoveredSong(songID)
  }
  const handleSongMouseLeave = () => {
    setHoveredSong(null)
  }
  const handleDelete = async (songID) => {
    try{
      const response = await axios.delete(EXPRESS_URL + `/api/deleteSong/${songID}`) 
      
      if (response.status === 200) {
        console.log(response.data.state,'deleting song:', songID)
        // 곡 목록 가져오기
        const songResponse = await fetch(EXPRESS_URL + '/api/songs')
        const songsData = await songResponse.json()
        console.log('Success getting songs list')
        setSongs(songsData)
      } else {
        console.error('Error deleting song:', response.data.error)
      }
    } catch(error){
      console.error('Error deleting song:', error)
    }
  }

  // 곡 수정 
  const handleEdit = async (songID) => {
    try {
      setDialogMessage('모든 정보를 입력하여 곡을 수정하세요(이미지 제외)')
      const songToEdit = filteredSongs.find((song) => song.songID === songID);

      const getDifficultyResponse = await axios.get(EXPRESS_URL +`/api/getDiff/${songID}`);
      const diffData = getDifficultyResponse;
      let diff = ''
        
      // 데이터가 있는지를 검사
      if (diffData.data && diffData.data.length) {
        for (let i = 0; i< diffData.data.length; i++){
          diff += diffData.data[i].difficulty
          if (i !== diffData.data.length -1){
            diff += ', '
          }
        }
      } else {
        console.log('난이도 목록이 없네') 
      }
    
      console.log(diff)
      setEditSongData({
        songName: songToEdit.songName,
        composer: songToEdit.composer,
        releaseDate: songToEdit.releaseDate,
        difficulty: diff,
      });
      setEditSongId(songID);
      setShowEditSong(true);
      setShowUsers(false);
    } catch (err) {
      console.error('error at handleEdit:', err);
    }
  }
  const handleEditSongDialogClose = () => { 
    setIsLoading(false); 
    setShowEditSong(false)
    setEditSongData({
      songName: '',
      composer: '',
      releaseDate: '',
      difficulty: ''
    });
  }
  const handleEditSongInputChange = (event) => {
    const { name, value } = event.target;
    setEditSongData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  }
  const handleEditSongSubmit = async () => {
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('songName', editSongData.songName);
      formData.append('composer', editSongData.composer);
      formData.append('releaseDate', editSongData.releaseDate);
      formData.append('difficulty', editSongData.difficulty);
      
      setDialogMessage('곡이 수정되었습니다(3s)')
      
      await axios.post(EXPRESS_URL + '/api/editSong/' + editSongId, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Song edited successfully');
      setTimeout(() => { handleEditSongDialogClose()}, 1000)

      // 업데이트 된 곡 목록 가져오기
      const songResponse = await fetch(EXPRESS_URL + '/api/songs');
      const songsData = await songResponse.json();
      console.log('success get songs list');
      setSongs(songsData);
    } catch (error) {
      console.error('Error editing song:', error);
    }
  }

  const handleKeyPress = (e) => {
    // 활성화되지 않은 다이어로그는 데이터가 모두 초기화된 상태인 것을 이용함
    if (e.key === 'Enter') {
      // 곡 추가 다이어로그의 경우
      if (addSongData.songName !== ''){
        handleAddSongSubmit()
      }
      // 곡 수정 다이어로그의 경우
      if (editSongData.songName !== ''){
        handleEditSongSubmit()
      }
    }
  };
  
  // 폼이 모두 채워지지 않은 경우 버튼이 비활성화되어야
  const isAddConfirmButtonDisabled = 
        !addSongData.difficulty || !addSongData.songName || !addSongData.composer || !addSongData.releaseDate || !addSongData.selectedImage
  const isChangeConfirmButtonDisabled = 
        !editSongData.songName || !editSongData.composer || !editSongData.releaseDate || !editSongData.difficulty
  
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
            {/*토글 버튼*/}
            <ToggleButtonGroup
              value={showUsers ? 'users' : 'songs'}
              exclusive
              onChange={handleToggle}
              aria-label="Toggle users/songs"
              sx={{ marginLeft: 1, marginRight: 2 }}
            >
              <ToggleButton value="songs" aria-label="Songs">
                곡 목록
              </ToggleButton>
              <ToggleButton value="users" aria-label="Users">
                유저 목록
              </ToggleButton>
            </ToggleButtonGroup>
            {showUsers ? null : (
              <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddSong}>
                곡 추가
              </Button>
            )}
            <Box sx={{ flex: 1, textAlign: 'right' }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: '30px' }}>
                {user.nick}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {user.userID}
              </Typography>
            </Box>
          </Box>
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
              justifyContent: filteredSongs.length === 0 && filteredUsers.length === 0 ? 'center' : 'flex-start',
            }}
          >
            {/*토글버튼의 상태에 따른 리스트의 변화*/}
            {showUsers ? (
              filteredUsers.length === 0 ? (
                <Typography variant="h6">User Not Found</Typography>
              ) : (
                <List sx={{ width: '100%' }}>
                  {filteredUsers.map((user) => (
                    <ListItem
                      key={user.userID}
                      onClick={() => handleUserClick(user.userID)}
                      button
                      sx={{
                        mb: 2,
                        width: '100%',
                        borderRadius: theme.shape.borderRadius,
                      }}
                    >
                      <ListItemText
                        sx={{
                          '& .MuiTypography-root': {
                            fontWeight: 'bold',
                            textShadow: '0 0 0px 15px white',
                          },
                        }}
                        primary={highlightText(user.nick, searchTerm)}
                        secondary={highlightText(user.email, searchTerm)}
                        primaryTypographyProps={{ variant: 'body1' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      <Typography variant="caption">{highlightText(user.userID, searchTerm)}</Typography>
                    </ListItem>
                  ))}
                </List>
              )
            ) : filteredSongs.length === 0 ? (
              <Typography variant="h6">Song Not Found</Typography>
            ) : (
              <List sx={{ width: '100%' }}>
                {filteredSongs.map((song) => (
                  <ListItem
                    key={song.songID}
                    onMouseEnter={() => handleSongMouseEnter(song.songID)}
                    onMouseLeave={handleSongMouseLeave}
                    onClick={() => handleSongClick(song.songID)}
                    button
                    sx={{
                      mb: 2,
                      position: 'relative',
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
                        zIndex: -1,
                        transition: 'opacity 0.3s',
                      },
                      '&:hover': {
                        '&::before': {
                          opacity: 0,
                        },
                      },
                    }}
                  >
                    {/*hover 상태인 경우 하얗게*/}
                    {hoveredSong === song.songID && (
                      <React.Fragment>
                        <IconButton
                          onClick={(event) => {
                            event.stopPropagation(); // Prevent the song click event from firing
                            handleEdit(song.songID);
                          }}
                          style={{ position: 'absolute', top: '50%', left: '40%', transform: 'translate(-50%, -50%)' }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={(event) => {
                            event.stopPropagation(); // Prevent the song click event from firing
                            handleDelete(song.songID);
                          }}
                          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </React.Fragment>
                    )}
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
      </Container>
      {/* 곡 추가하는 다이얼로그 */}
      <Dialog open={showAddSong} onClose={handleAddSongDialogClose}>
        <DialogTitle>추가할 곡 정보</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="songName"
            name="songName"
            label="곡 이름"
            fullWidth
            value={addSongData.songName}
            onChange={handleAddSongInputChange}
            onKeyPress={handleKeyPress}
          />
          <TextField
            margin="dense"
            id="composer"
            name="composer"
            label="작곡가"
            fullWidth
            value={addSongData.composer}
            onChange={handleAddSongInputChange}
            onKeyPress={handleKeyPress}
          />
          <TextField
            margin="dense"
            id="releaseDate"
            name="releaseDate"
            label="출시일"
            fullWidth
            value={addSongData.releaseDate}
            onChange={handleAddSongInputChange}
            onKeyPress={handleKeyPress}
          />
          <TextField
            margin="dense"
            id="difficulty"
            name="difficulty"
            label="난이도"
            fullWidth
            value={addSongData.difficulty}
            onChange={handleAddSongInputChange}
            onKeyPress={handleKeyPress}
          />
          {/*로딩중일 때, 아닐 때 메시지*/}
          { isLoading ? (
            <Typography variant="body2" sx={{ color: 'red', userSelect: 'none' }}>
              {dialogMessage}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: 'white', userSelect: 'none' }}>
              {'NULL'}
            </Typography>
          )}
          {/*이미지 출력하는 곳. 기본적으로 서버의 더미이미지로 설정되어있음*/}
          <input
            accept="image/*"
            id="image"
            name="image"
            type="file"
            style={{ display: 'none' }}
            onChange={handleImageSelect}
          />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label htmlFor="image">
              <Button variant="outlined" component="span">
                곡 이미지 선택
              </Button>
            </label>
            {addSongData.selectedImage ? (
              <img
                src={addSongData.selectedImageUrl}
                alt="곡자켓"
                style={{ width: '100px', height: '100px', marginLeft: '1rem' }}
              />
            ) : (
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  marginLeft: '1rem',
                  backgroundImage: addSongData.selectedImage ? `url(${addSongData.selectedImageUrl})` : `url('./images/dummy.webp')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              ></div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddSongDialogClose}>취소</Button>
          <Button 
            onClick={handleAddSongSubmit} disabled={ isAddConfirmButtonDisabled || isLoading }>
            추가
          </Button>
        </DialogActions>
      </Dialog>
      {/*곡 수정하는 다이얼로그*/}
      <Dialog open={showEditSong} onClose={handleEditSongDialogClose}>
        <DialogTitle>수정할 곡 정보</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="songName"
            name="songName"
            label="곡 이름"
            fullWidth
            value={editSongData.songName}
            onChange={handleEditSongInputChange}
            onKeyPress={handleKeyPress}
          />
          <TextField
            margin="dense"
            id="composer"
            name="composer"
            label="작곡가"
            fullWidth
            value={editSongData.composer}
            onChange={handleEditSongInputChange}
            onKeyPress={handleKeyPress}
          />
          <TextField
            margin="dense"
            id="releaseDate"
            name="releaseDate"
            label="출시일"
            fullWidth
            value={editSongData.releaseDate}
            onChange={handleEditSongInputChange}
            onKeyPress={handleKeyPress}
          />
          <TextField
            margin="dense"
            id="difficulty"
            name="difficulty"
            label="난이도"
            fullWidth
            value={editSongData.difficulty}
            onChange={handleEditSongInputChange}
            onKeyPress={handleKeyPress}
          />
          { isLoading ? (
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
          <Button onClick={handleEditSongDialogClose}>취소</Button>
          <Button onClick={handleEditSongSubmit} disabled={ isChangeConfirmButtonDisabled || isLoading }>
            수정
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={isLoggedOut}
        message="로그아웃되었습니다."
        autoHideDuration={2000} // 2초 후에 자동으로 닫힘
      />
    </ThemeProvider>
  )
}

export default MainScreen
