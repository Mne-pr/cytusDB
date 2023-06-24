import express from "express"
import mysql from "mysql"
import bodyParser from "body-parser"
import cors from "cors"
import { v5, NIL } from 'uuid'
import dbconf from "./conf/auth.js"
import crypto from 'crypto'
import jwt from 'jsonwebtoken' // 쿠키로 전송하는 것 포기한 대응책 JWT
import multer from 'multer'
import util from 'util'

const secretKey = 'cytus2db'
const app = express()
const port = 3010
const db = mysql.createConnection(dbconf)
db.connect()

// credentials - 쿠키사용여부
app.use(cors({ origin: 'https://database-edaaj.run.goorm.site', credentials: true }));
app.use(bodyParser.json())
app.use((err, req, res, next) => {
  console.error('Promise(곡 추가,유저 정보 수정) Error:',err);
  res.status(500).send('Promise(곡 추가,유저 정보 수정) Error:',err);
});
const upload = multer()
const dbQuery = util.promisify(db.query).bind(db)

const createHashedPassword = (password) => {
  return crypto.createHash("sha512").update(password).digest("base64");
};

// 메인
app.get('/', (req, res) => {
  res.json({result: "success"})
})

// 토큰 확인
app.get('/verifyToken', (req, res) => {
  const token = req.headers['x-access-token']
  try {
    const decoded = jwt.verify(token, secretKey)
    res.json(decoded)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// 곡 목록 전달
app.get('/api/songs', (req, res) => {
  const songSql = "SELECT songImage, songID, songName, composer, DATE_FORMAT(releaseDate, '%Y-%m-%d') AS releaseDate FROM Songs;"

  db.query(songSql, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    const songs = rows.map(row => ({
      songID: row.songID,
      songName: row.songName,
      composer: row.composer,
      releaseDate: row.releaseDate,
      songImage: row.songImage.toString('base64')
    }));

    res.json(songs);
  });
});

// 곡에 대한 난이도 전달
app.get('/api/getDiff/:songID', (req,res) => {
  const songID = req.params.songID
  const diffSql = "SELECT difficulty,difficultyID FROM Difficulties WHERE songID=?;"
  
  db.query(diffSql,[songID], (err,row) => {
    if(err){
      console.error('난이도 찾기 실패:',err)
      return res.status(500).json({ error: '난이도 검색 중 오류가 발생했습니다.' })
    }
    
    return res.status(200).json(row)
  })
})

// 곡 정보 전달
app.get('/api/getSongInfo/:songID', (req, res) => {
  const songID = req.params.songID
  const songSql = 'SELECT songName, composer, releaseDate, songImage FROM Songs WHERE songID=?;'
  const diffSql = 'SELECT difficulty FROM Difficulties WHERE songID=?;'

  db.query(songSql, [songID], (err, songRow) => {
    if (err) {
      console.error('곡 정보 찾기 실패:', err)
      return res.status(500).json({ error: '곡 정보 찾기 중 오류가 발생했습니다.' })
    }

    if (songRow.length === 0) {
      console.error('곡 정보를 찾을 수 없습니다.')
      return res.status(404).json({ error: '곡 정보를 찾을 수 없습니다.' })
    }

    db.query(diffSql, [songID], (diffErr, diffRow) => {
      if (diffErr) {
        console.error('곡 난이도 찾기 실패:', diffErr)
        return res.status(500).json({ error: '곡 난이도 찾기 중 오류가 발생했습니다.' })
      }

      const songInfo = {
        songName: songRow[0].songName,
        composer: songRow[0].composer,
        releaseDate: songRow[0].releaseDate,
        songImage: songRow[0].songImage.toString('base64'),
        difficulties: diffRow.map(row => row.difficulty).join(', ')
      }
      
      res.status(200).json(songInfo)
    })
  })
})

// 점수, 랭킹 전달
app.get('/api/getRanking/:userID/:songID/:difficulty', (req, res) => {
  const userID = req.params.userID
  const songID = req.params.songID
  const difficulty = req.params.difficulty

  const scoreSqlM = [userID,songID,difficulty]
  const rankSqlM = [songID, difficulty] 
  
  const scoreSql = `SELECT score FROM PlayResults WHERE userID=? AND difficultyID=(SELECT difficultyID FROM Difficulties WHERE songID=? AND difficulty=?)`
  const rankSql = 
        `SELECT Users.nick, PlayResults.score FROM PlayResults
          JOIN Difficulties ON PlayResults.difficultyID=Difficulties.difficultyID
          JOIN Users ON PlayResults.userID=Users.userID
          WHERE Difficulties.songID=? AND Difficulty=?
          ORDER BY PlayResults.rank;`
  
  var score = 0
  var rank = []
  
  db.query(scoreSql, scoreSqlM, (err, scoreRow) => {
    if(err){
      console.error('점수 읽기 실패:',err)
      return res.status(500).json({ error: '점수를 읽어오는 도중 오류가 발생했습니다.' })
    } 
    
    if (scoreRow.length !== 0) {
      score = scoreRow[0].score
    }
    
    db.query(rankSql, rankSqlM, (eerr, rankRow) => {
      if(eerr){
        console.error('랭킹 읽기 실패:',eerr)
        return res.status(500).json({ error: '랭킹을 읽어오는 도중 오류가 발생했습니다.' })
      }
      
      if (rankRow.length !== 0){
        rank = rankRow
      }
      
      res.status(200).json({score, rank})
      
    })
  })
})

// 유저 목록 전달
app.get('/api/users', (req, res) => {
  const userSql = "SELECT userID, email, nick FROM Users;"

  db.query(userSql, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: '유저 정보를 가져오는 데 오류가 발생했습니다.' });
    }
    const users = rows.map(row => ({
      userID: row.userID,
      email: row.email,
      nick: row.nick,
    }));

    res.json(users);
  });
});

// 유저 정보 전달
app.get('/api/getUserInfo/:userID', (req,res) => {
  const userID = req.params.userID
  const userSql = "SELECT nick,email FROM Users WHERE userID=?;"
  const playResultSql = "SELECT * FROM PlayResults WHERE userID=?";
  var playResultData = []
  
  db.query(userSql, [userID], (userErr, userRow) => {
    if(userErr){
      console.error('유저 데이터 읽기 실패.')
      return res.status(500).json({ error: '유저 데이터를 찾는 중 오류가 발생했습니다.' })
    }
    
    db.query(playResultSql, [userID], (playResultErr, playResultRow) => {
      if(playResultErr){
        console.error('유저 플레이기록 읽기 실패.')
        return res.status(500).json({ error: '유저 플레이기록을 찾는 중 오류가 발생했습니다.' })
      }
      
      if(playResultRow.length !== 0){
        playResultData = playResultRow
      }
      
      return res.status(200).json({userRow, playResultData})
    })  
  })
})

// 곡 추가
app.post('/api/addSong', upload.single('songImage'), async (req, res) => {
  try {
    const { songName, composer, releaseDate, difficulty } = req.body;
    const songImage = req.file.buffer;

    const songSql = "INSERT INTO Songs (songName, composer, releaseDate, songImage) VALUES (?, ?, ?, ?);";
    const difficultySql = "INSERT INTO Difficulties (songID, difficulty) VALUES (?, ?);";

    // 1. 곡 정보를 Songs 테이블에 삽입, 동시에 삽입한 곡의 songID 받아옴
    const insertedSongID = await new Promise((resolve, reject) => {
      db.query(songSql, [songName, composer, releaseDate, songImage], (err, result) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log('Song added to Songs table');
          resolve(result.insertId);
        }
      })
    })

    // 2. 각 난이도를 Difficulties 테이블에 삽입
    const valuesArray = difficulty.split(",").map((item) => item.trim());
    for (const value of valuesArray) {
      await new Promise((resolve, reject) => {
        db.query(difficultySql, [insertedSongID, value], (err) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            console.log(`Inserted difficulty (${value}) for songID (${insertedSongID}) into Difficulties table.`);
            resolve();
          }
        });
      });
    }

    res.json({ state: 'success' });
  } catch (error) {
    console.error('Error adding song:', error);
    res.status(500).json({ error: error.message });
  }
});

// 곡 삭제
app.delete('/api/deleteSong/:songID', (req, res) => {
  const songID = req.params.songID
  const songSql = "DELETE FROM Songs WHERE songID=?"

  db.query(songSql, [songID], (err, row) => {
    if(err){
      console.error('삭제 실패:',err)
      return res.status(500).json({ error: '곡 삭제 중 오류가 발생했습니다.' })
    }
    if (row.affectedRows === 0) {
      return res.status(404).json({ error: '해당하는 곡을 찾을 수 없습니다.' })
    }
    console.log('곡이 성공적으로 삭제됨', row)
    res.status(200).json({ state: 'success' })
  })
})

// 곡 수정 - 사진제외
app.post('/api/editSong/:editSongID', upload.none(), async (req, res) => {
  try {
    const editSongID = req.params.editSongID;
    const songName = req.body.songName;
    const composer = req.body.composer;
    const releaseDate = req.body.releaseDate;
    const difficulty = req.body.difficulty;
    const diffs = difficulty.split(",").map((item) => item.trim());

    const songSql = "UPDATE Songs SET songName=?, composer=?, releaseDate=? WHERE songID=?";
    const difficultySql = "DELETE FROM Difficulties WHERE songID=?";
    const difficultySql2 = "INSERT INTO Difficulties (songID, difficulty) VALUES (?, ?)";

    await dbQuery(songSql, [songName, composer, releaseDate, editSongID]);

    await dbQuery(difficultySql, [editSongID]);

    for (const value of diffs) {
      await dbQuery(difficultySql2, [editSongID, value]);
      console.log(`Inserted difficulty (${value}) for songID (${editSongID}) into Difficulties table.`);
    }

    res.status(200).send('Song edited successfully');
  } catch (err) {
    console.log('Song Edit Error:', err);
    res.status(500).send('Error editing song');
  }
});

// 회원가입 - 무조건 일반유저 계정으로 - 구현 완료
app.post('/Signup', (req, res) => {
  // 클라이언트에서 전송한 데이터를 받습니다.
  const { email, nickname, password } = req.body
  var UID = v5(nickname, NIL)
  var newPW = createHashedPassword(password) // 암호화만 가능하대
  const userSql = "INSERT INTO Users (userID, email, nick, passWD) VALUES(?, ?, ?, ?);"
  const adminSql = "INSERT INTO Admins (userID, adminFlag) VALUES(?, ?);"
  var ret = { success : "", error : "" }
  
  db.query(userSql, [UID, email, nickname, newPW], (err, rows) => {
    if (err) {
      ret["error"] += "userError(" + err + ") "
      res.status(500).json({ error: err.message });
      return console.log(err)
    }
    ret["success"] += "userOK "

    db.query(adminSql, [UID, 0], (err, rows) => {
      if (err) {
        ret["error"] += "adminError(" + err + ") "
        res.status(500).json({ error: err.message });
        return console.log(err)
      }
      ret["success"] += "adminOK "

      res.json(ret)
    })
  })
})
// SELECT * FROM Users LEFT JOIN Admins ON Users.userID = Admins.userID;

// 로그인 - 구현 완료
app.post('/Login', (req, res) => {
  const { id, password } = req.body
  const newPW = createHashedPassword(password)
  const userSql = "SELECT userID, email, nick, passWD FROM Users WHERE BINARY email = ? OR BINARY nick = ?;"
  const adminSql = "SELECT adminFlag FROM Admins WHERE userID=?;"
  
  db.query(userSql, [id, id], (err, rows) => {
    if (err) {
      console.log(err)
      res.status(400).json({ what: 'error', error: err })
      return
    }
    if(rows.length == 0){
      console.log("존재하지 않는 아이디")
      res.json({ what: 'error', error: 'Account not exist' })
      return
    }
    if (newPW != rows[0].passWD){
      console.log("틀린 비밀번호")
      res.json({ error: 'Account not exist' })
      return
    }
    
    db.query(adminSql, rows[0].userID, (err, nrows) => {
      if (err) {
        console.log(err)
        res.status(400).json({ what: 'error', error: err })
        return
      }      
      const token = jwt.sign({
        userID: rows[0].userID,
        email: rows[0].email,
        nick: rows[0].nick,
        admin: nrows[0].adminFlag
      }, secretKey);
      
      res.json({ what: 'success', token })
    })
  })
})

// 유저정보수정 - 일반유저
app.post('/api/editUser', async (req, res) => {
  try {
    const { userID, email, nick, curPassword, newPassword, adminFlag } = req.body
    const hashedCurPassword = createHashedPassword(curPassword)

    // 비밀번호 알아오기 using userID
    const passWDSql = 'SELECT passWD FROM Users WHERE userID = ?;'
    const rows = await new Promise((resolve, reject) => {
      db.query(passWDSql, [userID], (err, rows) => {
        if (err) {
          console.log("passWDSql Error,", err)
          reject(err)
        }
        resolve(rows)
      })
    })

    const realPassword = rows[0].passWD

    // 비밀번호 대조
    if (hashedCurPassword !== realPassword) {
      return res.status(200).json({ status: 'fail(PW)' })
    }

    // 본격 질의 - User
    let hashedNewPassword = null
    if (newPassword !== '') {
      hashedNewPassword = createHashedPassword(newPassword)
    } else {
      hashedNewPassword = realPassword
    }
    const userSql = 'UPDATE Users SET email=?, nick=?, passWD=? WHERE userID=?;'
    await db.query(userSql, [email, nick, hashedNewPassword, userID])

    // 본격 질의 - Admin
    const adminSql = 'UPDATE Admins SET adminFlag=? WHERE userID=?;'
    await db.query(adminSql, [adminFlag, userID])

    console.log('정보변경 완료')
    const token = jwt.sign({
      userID: userID,
      email: email,
      nick: nick,
      admin: adminFlag
    }, secretKey);

    return res.status(200).json({ status: 'success', token })

  } catch (error) {
    console.error(error)
    return res.status(200).json({ status: 'error' })
  }
})

// 유저 플레이 데이터 추가
app.post('/api/addPlayResult', async (req, res) => {
  try {
    const { userID, songID, difficultyID, difficulty, score } = req.body;
    var result=[]

    // 원래 스코어 읽어와서 비교, 없는 경우 그냥 추가
    const prePlayResultSql = `SELECT score FROM PlayResults WHERE userID = ? AND difficultyID = ?;`;
    // 단순히 추가
    const addPlayResultSql = `INSERT INTO PlayResults (userID, difficultyID, score) VALUES (?, ?, ?);`;
    // 또는 업데이트(이미 존재하는 튜플의 경우)
    const updatePlayResultSql = `UPDATE PlayResults SET score = ? WHERE userID = ? AND difficultyID = ?;`;
    // 추가한 뒤 랭킹 갱신
    const updateRankSql = `
      UPDATE PlayResults
      SET rank = (
        CASE
          WHEN @prev_difficultyID = difficultyID THEN (@rank := @rank + 1)
          WHEN @prev_difficultyID := difficultyID THEN (@rank := 1)
        END
      ) WHERE difficultyID = ? ORDER BY score DESC;`
    
    // 기존 스코어 읽어옴
    const preResults = await new Promise((resolve, reject) => {
      db.query(prePlayResultSql, [userID, difficultyID], (err, results) => {
        if (err) {
          console.error('prePlayResultSql Error:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
    
    // 기존 스코어 존재하는 경우 -> 비교하여 업데이트 결정
    if (preResults.length > 0) {
      if (preResults[0].score < score) {
        await new Promise((resolve, reject) => {
          db.query(updatePlayResultSql, [score, userID, difficultyID], (err, results) => {
            if (err) {
              console.error('prePlayResultSql Error:', err);
              reject(err);
            } else {
              resolve();
            }
          });
        });
        result = {success: '신기록 업데이트'}
      } else {
        result = {success: '점수 변동 없음'}
      }
    } else {
      await new Promise((resolve, reject) => {
        db.query(addPlayResultSql, [userID, difficultyID, score], (err, results) => {
          if (err) {
            console.error('prePlayResultSql Error:', err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
      result = {success: '신기록 추가'}
    }
    
    console.log(result)
    // 랭킹 정리
    if (result.success !== '점수 변동 없음'){
      await dbQuery('SET @rank := 0;');
      await dbQuery('SET @prev_difficultyID := NULL;');
      await new Promise((resolve, reject) => {
        dbQuery(updateRankSql, [difficultyID])
          .then(() => {
            resolve();
          })
          .catch((updateErr) => {
            console.error('updateRankSql Error:', updateErr);
            reject(updateErr);
          });
      });
      return res.status(200).json(result);  
      
    } else {
      return res.status(200).json(result) 
    }   
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '서버 오류' });
  }
});


app.listen(port, () => {
  console.log(`서버 실행됨 (port ${port})`)
})