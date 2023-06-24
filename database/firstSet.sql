 바뀐거 
- Songs의 releaseDate 형식 VARCHAR -> DATE
- Difficulties의 Primary_Key songID -> songID,difficulty
- Songs에 songImage 추가
- Difficulties 테이블에 difficultyID 추가
- PlayResults 테이블에 difficulty가 아닌 difficultyID를 추가, resultID도 추가
- PlayResults 테이블의 rank는 not null 삭제

DROP DATABASE IF EXISTS cytus2DB;

CREATE DATABASE IF NOT EXISTS cytus2DB 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_general_ci;
 
USE cytus2DB;

CREATE TABLE Users (
  userID    VARCHAR(255) NOT NULL,
  email     VARCHAR(255) NOT NULL,
  nick      VARCHAR(255) NOT NULL,
  passWD    VARCHAR(255) NOT NULL,
  PRIMARY KEY(userID)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_general_ci;
  
  CREATE TABLE Admins (
  userID    VARCHAR(255) NOT NULL,
  adminFlag BOOLEAN      NOT NULL,
  PRIMARY KEY (userID),
  FOREIGN KEY (userID) REFERENCES Users(userID)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_general_ci;
  
CREATE TABLE Songs (
  songID INT NOT NULL AUTO_INCREMENT,
  songName    VARCHAR(255) NOT NULL,
  composer    VARCHAR(255) NOT NULL,
  releaseDate DATE         NOT NULL,
  songImage   BLOB,
  PRIMARY KEY(songID)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_general_ci;
  
CREATE TABLE Difficulties (
  difficultyID INT NOT NULL AUTO_INCREMENT,
  songID       INT NOT NULL,
  difficulty   VARCHAR(255) NOT NULL,
  PRIMARY KEY(difficultyID),
  FOREIGN KEY(songID) REFERENCES Songs(songID)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_general_ci;

CREATE TABLE PlayResults (
  resultID   INT          NOT NULL AUTO_INCREMENT,
  userID     VARCHAR(255) NOT NULL,
  difficultyID INT         NOT NULL,
  score      INT          NOT NULL,
  rank       INT          ,
  PRIMARY KEY(resultID),
  FOREIGN KEY(userID) REFERENCES Users(userID)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY(difficultyID) REFERENCES Difficulties(difficultyID)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  INDEX(userID),
  INDEX(difficultyID)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_general_ci;

  
유저는 직접 Signup에서 추가하는 게 나음 - 이메일, 닉네임, 비밀번호
email1@naver.com user1 user1
email2@naver.com user2 user2
email3@naver.com user3 user3
email4@naver.com user4 user4
email5@naver.com admin1 admin1

노래추가
INSERT INTO Songs (songName, composer, releaseDate) VALUES ("Celestial Sounds(KIVA Remix)", "3R2", "2018-01-17");
INSERT INTO Songs (songName, composer, releaseDate) VALUES ("Break Through The Barrier", "lixound", "2018-08-03");
INSERT INTO Songs (songName, composer, releaseDate) VALUES ("Hydrangea", "Tatsh", "2018-01-17");
INSERT INTO Songs (songName, composer, releaseDate) VALUES ("Lamentation", "ARForest", "2022-07-20");
INSERT INTO Songs (songName, composer, releaseDate) VALUES ("Glorious Crown", "xi", "2020-05-08");
INSERT INTO Songs (songName, composer, releaseDate) VALUES ("Marigold", "M2U", "2020-09-15");
INSERT INTO Songs (songName, composer, releaseDate) VALUES ("Chrome VOX", "t+pazolite", "2018-01-17");
INSERT INTO Songs (songName, composer, releaseDate) VALUES ("Re:Boost", "EAjRock", "2018-01-17");
INSERT INTO Songs (songName, composer, releaseDate) VALUES ("100sec Cat Dreams", "Ayatsugu_Revolved", "2018-05-30");
INSERT INTO Songs (songName, composer, releaseDate) VALUES ("V.", "AEsir", "2019-01-12");

UPDATE Songs SET songImage=LOAD_FILE('/var/lib/mysql-files/Celestial_Sounds.webp') WHERE songID=1;
UPDATE Songs SET songImage=LOAD_FILE('/var/lib/mysql-files/Break_Through_The_Barrier.webp') WHERE songID=2;
UPDATE Songs SET songImage=LOAD_FILE('/var/lib/mysql-files/Hydrangea.webp') WHERE songID=3;
UPDATE Songs SET songImage=LOAD_FILE('/var/lib/mysql-files/Lamentation.webp') WHERE songID=4;
UPDATE Songs SET songImage=LOAD_FILE('/var/lib/mysql-files/Glorious_Crown.webp') WHERE songID=5;
UPDATE Songs SET songImage=LOAD_FILE('/var/lib/mysql-files/Marigold.webp') WHERE songID=6;
UPDATE Songs SET songImage=LOAD_FILE('/var/lib/mysql-files/Chrome_Vox.webp') WHERE songID=7;
UPDATE Songs SET songImage=LOAD_FILE('/var/lib/mysql-files/Re_Boost.webp') WHERE songID=8;
UPDATE Songs SET songImage=LOAD_FILE('/var/lib/mysql-files/100sec_Cat_Dreams.webp') WHERE songID=9;
UPDATE Songs SET songImage=LOAD_FILE('/var/lib/mysql-files/V.webp') WHERE songID=10;

INSERT INTO Difficulties (songID, difficulty) VALUES (1,"E3");
INSERT INTO Difficulties (songID, difficulty)VALUES (1,"H8");
INSERT INTO Difficulties (songID, difficulty)VALUES (1,"C14");
INSERT INTO Difficulties (songID, difficulty)VALUES (2,"E4");
INSERT INTO Difficulties (songID, difficulty)VALUES (2,"H8");
INSERT INTO Difficulties (songID, difficulty)VALUES (2,"C13");
INSERT INTO Difficulties (songID, difficulty)VALUES (3,"E3");
INSERT INTO Difficulties (songID, difficulty)VALUES (3,"H6");
INSERT INTO Difficulties (songID, difficulty)VALUES (3,"C12");
INSERT INTO Difficulties (songID, difficulty)VALUES (3,"G14");
INSERT INTO Difficulties (songID, difficulty)VALUES (4,"E6");
INSERT INTO Difficulties (songID, difficulty)VALUES (4,"H10");
INSERT INTO Difficulties (songID, difficulty)VALUES (4,"C14");
INSERT INTO Difficulties (songID, difficulty)VALUES (4,"G15");
INSERT INTO Difficulties (songID, difficulty)VALUES (5,"E6");
INSERT INTO Difficulties (songID, difficulty)VALUES (5,"H10");
INSERT INTO Difficulties (songID, difficulty)VALUES (5,"C15");
INSERT INTO Difficulties (songID, difficulty)VALUES (6,"E4");
INSERT INTO Difficulties (songID, difficulty)VALUES (6,"H9");
INSERT INTO Difficulties (songID, difficulty)VALUES (6,"C15");
INSERT INTO Difficulties (songID, difficulty)VALUES (7,"C14");
INSERT INTO Difficulties (songID, difficulty)VALUES (7,"H9");
INSERT INTO Difficulties (songID, difficulty)VALUES (7,"E4");
INSERT INTO Difficulties (songID, difficulty)VALUES (7,"G15");
INSERT INTO Difficulties (songID, difficulty)VALUES (8,"E2");
INSERT INTO Difficulties (songID, difficulty)VALUES (8,"C11");
INSERT INTO Difficulties (songID, difficulty)VALUES (8,"G13");
INSERT INTO Difficulties (songID, difficulty)VALUES (9,"E4");
INSERT INTO Difficulties (songID, difficulty)VALUES (9,"H7");
INSERT INTO Difficulties (songID, difficulty) VALUES (9,"C14");
INSERT INTO Difficulties (songID, difficulty)VALUES (10,"E6");
INSERT INTO Difficulties (songID, difficulty)VALUES (10,"H10");
INSERT INTO Difficulties (songID, difficulty)VALUES (10,"C15");


// 원래 score 조회
SELECT score
FROM PlayResults
WHERE userID = (SELECT userID FROM Users WHERE nick = '주어진 닉네임')
  AND difficultyID = (
    SELECT difficultyID FROM Difficulties
    WHERE songID = (SELECT songID FROM Songs WHERE songName = '노래 제목') AND difficulty = '주어진 난이도'
  );
  
SELECT score FROM PlayResults WHERE userID=? AND difficultyID=(SELECT difficultyID FROM Difficulties WHERE songID=? AND difficulty=?);

// 그냥 추가하는 거
INSERT INTO PlayResults (userID, difficultyID, score)
VALUES (
  (SELECT userID FROM Users WHERE nick = '주어진 닉네임'),
  (SELECT difficultyID FROM Difficulties WHERE songID = (SELECT songID FROM Songs WHERE songName = '주어진 노래 제목') AND difficulty = '주어진 난이도'),
  '주어진 점수'
);

// 업데이트하는 거
UPDATE PlayResults
SET score = '새로운 점수'
WHERE userID = (SELECT userID FROM Users WHERE nick = '주어진 닉네임')
  AND difficultyID = (SELECT difficultyID FROM Difficulties WHERE songID = (SELECT songID FROM Songs WHERE songName = '주어진 노래 제목') AND difficulty = '주어진 난이도');

// 랭크 총정리하는 거
SET @rank := 0;
SET @prev_difficultyID := NULL;
UPDATE PlayResults
SET rank = (
  CASE
    WHEN @prev_difficultyID = difficultyID THEN (@rank := @rank + 1)
    WHEN (@prev_difficultyID := difficultyID) IS NOT NULL THEN (@rank := 1)
  END
)
ORDER BY difficultyID, score DESC;


// 곡 이름, 곡 난이도에 해당하는 score만 랭크정리
SET @rank := 0;
SET @prev_difficultyID := NULL;
UPDATE PlayResults
SET rank = (
  CASE
    WHEN @prev_difficultyID = difficultyID THEN (@rank := @rank + 1)
    WHEN @prev_difficultyID := difficultyID THEN (@rank := 1)
  END
)
WHERE difficultyID = (
  SELECT difficultyID FROM Difficulties
  WHERE songID = ( SELECT songID FROM Songs WHERE songName = '노래 제목' )
  AND difficulty = '주어진 난이도'
)
ORDER BY score DESC;

// PlayResults 확인
SELECT * FROM PlayResults ORDER BY difficultyID, rank;

// 랭킹 불러오기
SELECT U.nick AS userName, PR.score
FROM PlayResults AS PR
JOIN Difficulties AS D ON PR.difficultyID = D.difficultyID
JOIN Users AS U ON PR.userID = U.userID
JOIN Songs AS S ON D.songID = S.songID
WHERE S.songName = '주어진 곡 제목'
  AND D.difficulty = '주어진 난이도'
ORDER BY PR.rank;

SELECT userName.nick, PlayResults.score FROM PlayResults
          JOIN Difficulties ON PlayResults.difficultyID=Difficulties.difficultyID
          JOIN Users ON PlayResults.userID=Users.userID
          WHERE Difficulties.songID=? AND Difficulty=?
          ORDER BY PlayResults.rank;



확인용
SELECT Songs.songID, songName, composer, releaseDate, difficulty FROM Songs LEFT JOIN Difficulties ON Songs.songID=Difficulties.songID;