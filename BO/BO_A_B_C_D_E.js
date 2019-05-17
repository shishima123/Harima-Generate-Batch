function Compare_To_Declare_BO_A_B_C_D_E() {
  let output = `
          -- ﾚｺｰﾄﾞ区分不正チェック
          -- フォーマットID　A B C D E  以外はエラー。
          IF STR_REC_KBN <> 'A' AND STR_REC_KBN <> 'B' AND STR_REC_KBN <> 'C' AND STR_REC_KBN <> 'D' AND STR_REC_KBN <> 'E' THEN
            --ｴﾗｰﾌﾗｸﾞをｾｯﾄ
            OUT_ERR_CD := STR_ERRCD_E10;
            -- ｴﾗｰﾒｯｾｰｼﾞのｾｯﾄ
            OUT_ERR_MSG := STR_ERRMSG_E10;
            GOTO ERR;
          ELSIF STR_REC_KBN = 'B' THEN
            OUT_DENPYO_MAISU          := OUT_DENPYO_MAISU + 1; -- タグ Bのレコードの場合、件数をカウントして戻り値・伝票枚数にセット。
          ELSIF STR_REC_KBN = 'C' THEN
            OUT_MEISAI_KENSU          := OUT_MEISAI_KENSU + 1; -- タグ Cのレコードの場合、件数をカウントして戻り値・明細件数にセット
          END IF;

          /********1*********2*********3*********4*********5*********6*********7*********8*********9*********10********11********12********13********14********15********16********
          * ﾚｺｰﾄﾞド区分順序ﾁｪｯｸ   ：PG毎に異なる
                                : スタートレコードの次はフォーマットIDの1ﾊﾞｲﾄ目がAでなければエラー。
                                : フォーマットIDの1ﾊﾞｲﾄ目 Aのレコードの次はBでなければエラー
                                : フォーマットIDの1ﾊﾞｲﾄ目 Bのレコードの次はCでなければエラー
                                : フォーマットIDの1ﾊﾞｲﾄ目 Cのレコードの次はC又はDでなければエラー
                                : フォーマットIDの1ﾊﾞｲﾄ目 Dのレコードの次はB又はEでなければエラー
                                : フォーマットIDの1ﾊﾞｲﾄ目 Eのレコードの次はA又はENDレコードでなければエラー
          ********1*********2*********3*********4*********5*********6*********7*********8*********9*********10********11********12********13********14********15********16********/
          -- レコード区分順序チェック
          -- スタートレコードの次はフォーマットIDがAでなければエラー。
          IF STR_START = E.OF_CONST('START') THEN

            IF STR_REC_KBN <> 'A' THEN
              -- ｴﾗｰﾌﾗｸﾞをｾｯﾄ
              OUT_ERR_CD := STR_ERRCD_E11;
              -- ｴﾗｰﾒｯｾｰｼﾞのｾｯﾄ
              OUT_ERR_MSG := STR_ERRMSG_E11;
              GOTO ERR;
            END IF;

          -- スタート区分に空白をｾｯﾄ
          STR_START := '';
          STR_ZEN_REC_KBN := STR_REC_KBN;

          -- フォーマットID Aのレコードの次はBでなければエラー
          ELSIF STR_ZEN_REC_KBN = 'A' THEN
            IF STR_REC_KBN <> 'B' THEN
              -- ｴﾗｰﾌﾗｸﾞをｾｯﾄ
              OUT_ERR_CD := STR_ERRCD_E11;
              -- ｴﾗｰﾒｯｾｰｼﾞのｾｯﾄ
              OUT_ERR_MSG := STR_ERRMSG_E11;
            GOTO ERR;
          END IF;

          ELSIF STR_ZEN_REC_KBN = 'B' THEN
            IF STR_REC_KBN <> 'C' THEN
              -- ｴﾗｰﾌﾗｸﾞをｾｯﾄ
              OUT_ERR_CD := STR_ERRCD_E11;
              -- ｴﾗｰﾒｯｾｰｼﾞのｾｯﾄ
              OUT_ERR_MSG := STR_ERRMSG_E11;
              GOTO ERR;
            END IF;

          ELSIF STR_ZEN_REC_KBN = 'C' THEN
            IF STR_REC_KBN <> 'C' AND STR_REC_KBN <> 'D' THEN
              -- ｴﾗｰﾌﾗｸﾞをｾｯﾄ
              OUT_ERR_CD := STR_ERRCD_E11;
              -- ｴﾗｰﾒｯｾｰｼﾞのｾｯﾄ
              OUT_ERR_MSG := STR_ERRMSG_E11;
              GOTO ERR;
            END IF;

          ELSIF STR_ZEN_REC_KBN = 'D' THEN
            IF STR_REC_KBN <> 'B' AND STR_REC_KBN <> 'E' THEN
              -- ｴﾗｰﾌﾗｸﾞをｾｯﾄ
              OUT_ERR_CD := STR_ERRCD_E11;
              -- ｴﾗｰﾒｯｾｰｼﾞのｾｯﾄ
              OUT_ERR_MSG := STR_ERRMSG_E11;
              GOTO ERR;
            END IF;

          ELSIF STR_ZEN_REC_KBN = 'E' THEN
            IF STR_REC_KBN <> 'A' AND SUBSTRB(WK_V_WRITCHAR, 1, 5) <> STR_END THEN
              -- ｴﾗｰﾌﾗｸﾞをｾｯﾄ
              OUT_ERR_CD := STR_ERRCD_E11;
              -- ｴﾗｰﾒｯｾｰｼﾞのｾｯﾄ
              OUT_ERR_MSG := STR_ERRMSG_E11;
              GOTO ERR;
            END IF;
          END IF;

        END IF;

        -- 前ﾚｺｰﾄﾞ区分のセット
        STR_ZEN_REC_KBN := STR_REC_KBN;

      END IF;
    END LOOP;

    -- ｵﾝﾗｲﾝ受信ﾌｧｲﾙを閉じる
    IF UTL_FILE.IS_OPEN(WK_FILE_HANDLE) = TRUE THEN
      UTL_FILE.FCLOSE(WK_FILE_HANDLE);
    END IF;

    -- ｽﾀｰﾄﾚｺｰﾄﾞのﾚｺｰﾄﾞ区分を取得 → ('START')
    STR_START         := E.OF_CONST('START');

    -- ｵﾝﾗｲﾝ受信ﾌｧｲﾙを開く
    IF UTL_FILE.IS_OPEN(WK_FILE_HANDLE) = FALSE THEN
      -- ファイルリストオープン
      WK_FILE_HANDLE := UTL_FILE.FOPEN(WK_V_PATH,IN_FILE_NM, 'R');
    END IF;

    -- 再度、ｵﾝﾗｲﾝ受信ファイルを順に読込み、ｵﾝﾗｲﾝ受注伝票①の登録を行う　
    REC.WORKSHUHAISHIN_SEQ_NO  := 0;
`;
  return output;
}

function Declare_To_SubStrbA_BO_A_B_C_D_E(json_table_WK) {
  let declare = `
    -- フォーマットCの型宣言
    DECLARE TYPE C_REC IS RECORD (
      BCD_SEQ_NO          NUMBER        := 1,
`;
  let afterDeclare = `
    -- TABLE TYPE TR_Cを宣言する
    TYPE TR_C IS TABLE OF C_REC;
      TABLE_C TR_C := TR_C();
      TYPE_C C_REC;
    BEGIN
`
  for (var i in json_table_WK) {
    var firstChar = json_table_WK[i].PHY_NM.slice(0, 1);
    if (firstChar == "M") {
      let phyNm = json_table_WK[i].PHY_NM;
      let spaceAfterPhysicNm = "                          ".slice(phyNm.length);
      let digit = json_table_WK[i].DIGIT;
      let spaceAfterVarchar2 = "          ".slice(digit.toString().length);

      declare += "        " + phyNm + spaceAfterPhysicNm + "VARCHAR2(" + json_table_WK[i].DIGIT + ")," + spaceAfterVarchar2 + "-- " + json_table_WK[i].LOG_NM + "\r";
    } else if (firstChar == "T") {
      break;
    }
  }

  // thay dau "," cuoi cung thanh ";"
  lastComma = declare.lastIndexOf(',');
  declare = declare.substr(0, lastComma) + ');' + declare.substr(lastComma + 2);
  let output = declare + afterDeclare;

  return output;
}

function SubStrbA_To_SubStrbBCDE_BO_A_B_C_D_E(json_table_WK ,namePhysicTableWK) {
  let SubStrb = `
      LOOP UTL_FILE.GET_LINE(WK_FILE_HANDLE, WK_V_WRITCHAR);

        --エンドレコードのレコード区分（'END  '）になるまで処理を行う
        EXIT WHEN SUBSTRB(WK_V_WRITCHAR,1,5) = STR_END;

          --1ﾚｺｰﾄﾞがすべて空白以外のﾁｪｯｸを行う
          IF TRIM(WK_V_WRITCHAR) IS NOT NULL THEN

            -- レコード区分を変数に代入
            STR_REC_KBN := TRIM(SUBSTRB(WK_V_WRITCHAR, 1, 1));

            IF TRIM(SUBSTRB(WK_V_WRITCHAR,1,5)) = STR_START THEN
              --  ｽﾀｰﾄﾚｺｰﾄﾞ
              REC.SHUHAISHIN1_CD      := SUBSTRB(WK_V_WRITCHAR, 6, 5);              -- 集配信一次店CD
              REC.SHUHAISHIN2_CD      := SUBSTRB(WK_V_WRITCHAR, 11, 4);             -- 集配信二次店CD
              REC.SHUHAISHIN3_CD      := SUBSTRB(WK_V_WRITCHAR, 15, 4);             -- 集配信三次店CD
              REC.JYUSHIN_YMD         := SUBSTRB(WK_V_WRITCHAR, 23, 8);             -- 受信日
              REC.JYUSHIN_TIME        := SUBSTRB(WK_V_WRITCHAR, 31, 6);             -- 受信時刻

            -- 伝票ﾍｯﾀﾞ（A）
            ELSIF STR_REC_KBN = 'A' THEN
              REC.WORKSHUHAISHIN_SEQ_NO  := REC.WORKSHUHAISHIN_SEQ_NO + 1;
`;

  let insert1 = `

            -- Insert to table ${namePhysicTableWK}
            INSERT INTO ${namePhysicTableWK}
              (CO_CD                      -- 会社コード
              ,EIGYO_CD                   -- 営業所コード
              ,SHUHAISHIN1_CD             -- 集配信コード（一次店）
              ,SHUHAISHIN2_CD             -- 集配信コード（二次店）
              ,SHUHAISHIN3_CD             -- 集配信コード（三次店）
              ,SHUHAISHIN_SEQ             -- 集配信連番
              ,WORKSHUHAISHIN_SEQ_NO      -- ワークSEQ_NO
              ,JYUSHIN_YMD                -- 受信日
              ,JYUSHIN_TIME               -- 受信時刻
              ,JYUSHIN_USER_CD            -- 受信者CD
`;

  let insert2 = `
              ,UPD_CNT                    -- 更新回数
              ,DEL_FLG                    -- 削除フラグ
              ,INS_DATETIME               -- 登録日時
              ,INS_USER_CD                -- 登録者(CD)
              ,INS_PG                     -- 登録PG
              ,UPD_DATETIME               -- 更新日時
              ,UPD_USER_CD                -- 更新者(CD)
              ,UPD_PG)                    -- 更新PG
            VALUES
              (IN_CO_CD
              ,IN_EIGYO_CD
              ,REC.SHUHAISHIN1_CD
              ,REC.SHUHAISHIN2_CD
              ,REC.SHUHAISHIN3_CD
              ,IN_SHUHAISHIN_SEQ
              ,REC.WORKSHUHAISHIN_SEQ_NO
              ,REC.JYUSHIN_YMD
              ,REC.JYUSHIN_TIME
              ,IN_JYUSHIN_USER_CD
`

  let insert3 = `
              ,1
              ,E.FN_削除フラグ('有効')
              ,SYSTIMESTAMP(3)
              ,C_USER_ID
              ,C_PGID
              ,SYSTIMESTAMP(3)
              ,C_USER_ID
              ,C_PGID);
`;


  var pos = 1;
  for (var i in json_table_WK) {
    var firstChar = json_table_WK[i].PHY_NM.slice(0, 1);

    if (firstChar == "F") {
      let phyNm = json_table_WK[i].PHY_NM;
      let spaceAfterPhysicNm = "                       ".slice(phyNm.length);
      let digit = json_table_WK[i].DIGIT;
      let subStrb = `:= SUBSTRB(WK_V_WRITCHAR, ${pos}, ${digit});`
      let logicNm = json_table_WK[i].LOG_NM;
      let lenSubStrb = pos.toString().length + digit.toString().length;
      let spaceAfterSubStrb = "                  -- ".slice(lenSubStrb);
      let spaceAfterPhysicNm2 = "                           -- ".slice(phyNm.length);

      // substring
      SubStrb += "              REC." + phyNm + spaceAfterPhysicNm + subStrb + spaceAfterSubStrb + logicNm + "\r";
      // column insert
      insert1 += "              ," + phyNm + spaceAfterPhysicNm2 + logicNm + "\r";
      // value insert
      insert2 += "              ,REC." + phyNm + "\r";
      pos = pos + Number(digit);
    } else if (firstChar == "H") {
      break;
    }
  }
  let output = SubStrb + insert1 + insert2 + insert3;
  return output;
}

function SubStrbBCDE_To_Insert_T_REL_BO_A_B_C_D_E(json_table_WK, namePhysicTableWK) {
  let strbB = `
            -- 伝票ﾍｯﾀﾞ（B）
            ELSIF STR_REC_KBN = 'B' THEN
`;

  let strbC = `

            --　明細レコド（C）
            ELSIF STR_REC_KBN = 'C' THEN
              REC.WORKSHUHAISHIN_SEQ_NO := REC.WORKSHUHAISHIN_SEQ_NO + 1;
              TYPE_C.BCD_SEQ_NO         := REC.WORKSHUHAISHIN_SEQ_NO;
              REC.WORKSHUHAISHIN_SEQ_NO := TYPE_C.BCD_SEQ_NO;                 -- フォーマットBCDにWORKSHUHAISHIN_SEQ_NOを設定
              WK_COUNT                  := WK_COUNT + 1;                      -- Cフォーマットのカウント数
`;

  let strbD = `

              TABLE_C.extend;
              TABLE_C(WK_COUNT) := TYPE_C;

            -- 伝票トレーラ（D）
            ELSIF STR_REC_KBN = 'D' THEN
`;

  let strbE = `

              WK_FLG                    := TRUE;
              WK_COUNT                  := 0;

            --　ファイルトレーラ（E）
            ELSIF STR_REC_KBN = 'E' THEN
              REC.WORKSHUHAISHIN_SEQ_NO := REC.WORKSHUHAISHIN_SEQ_NO + 1;
`;

  let beforeInsertFT = `

            -- Insert to table ${namePhysicTableWK}
            INSERT INTO ${namePhysicTableWK}
              (CO_CD                      -- 会社コード
              ,EIGYO_CD                   -- 営業所コード
              ,SHUHAISHIN1_CD             -- 集配信コード（一次店）
              ,SHUHAISHIN2_CD             -- 集配信コード（二次店）
              ,SHUHAISHIN3_CD             -- 集配信コード（三次店）
              ,SHUHAISHIN_SEQ             -- 集配信連番
              ,WORKSHUHAISHIN_SEQ_NO      -- ワークSEQ_NO
              ,JYUSHIN_YMD                -- 受信日
              ,JYUSHIN_TIME               -- 受信時刻
              ,JYUSHIN_USER_CD            -- 受信者CD
`;
  let midInsertFT = `
              ,UPD_CNT                    -- 更新回数
              ,DEL_FLG                    -- 削除フラグ
              ,INS_DATETIME               -- 登録日時
              ,INS_USER_CD                -- 登録者(CD)
              ,INS_PG                     -- 登録PG
              ,UPD_DATETIME               -- 更新日時
              ,UPD_USER_CD                -- 更新者(CD)
              ,UPD_PG)                    -- 更新PG
            VALUES
              (IN_CO_CD
              ,IN_EIGYO_CD
              ,REC.SHUHAISHIN1_CD
              ,REC.SHUHAISHIN2_CD
              ,REC.SHUHAISHIN3_CD
              ,IN_SHUHAISHIN_SEQ
              ,REC.WORKSHUHAISHIN_SEQ_NO
              ,REC.JYUSHIN_YMD
              ,REC.JYUSHIN_TIME
              ,IN_JYUSHIN_USER_CD
`;

  let afterInsertFT = `
              ,1
              ,E.FN_削除フラグ('有効')
              ,SYSTIMESTAMP(3)
              ,C_USER_ID
              ,C_PGID
              ,SYSTIMESTAMP(3)
              ,C_USER_ID
              ,C_PGID);

          END IF;
`;

  let beforeInsertBDE = `
          -- フォーマットBDEのデータをインサート
          IF WK_FLG THEN
            FOR i IN TABLE_C.FIRST .. TABLE_C.LAST
              LOOP
                INSERT INTO ${namePhysicTableWK}
                  (CO_CD                      -- 会社コード
                  ,EIGYO_CD                   -- 営業所コード
                  ,SHUHAISHIN1_CD             -- 集配信コード（一次店）
                  ,SHUHAISHIN2_CD             -- 集配信コード（二次店）
                  ,SHUHAISHIN3_CD             -- 集配信コード（三次店）
                  ,SHUHAISHIN_SEQ             -- 集配信連番
                  ,WORKSHUHAISHIN_SEQ_NO      -- ワークSEQ_NO
                  ,JYUSHIN_YMD                -- 受信日
                  ,JYUSHIN_TIME               -- 受信時刻
                  ,JYUSHIN_USER_CD            -- 受信者CD
`;

  let midInsertBDE = `
                  ,UPD_CNT                    -- 更新回数
                  ,DEL_FLG                    -- 削除フラグ
                  ,INS_DATETIME               -- 登録日時
                  ,INS_USER_CD                -- 登録者(CD)
                  ,INS_PG                     -- 登録PG
                  ,UPD_DATETIME               -- 更新日時
                  ,UPD_USER_CD                -- 更新者(CD)
                  ,UPD_PG)                    -- 更新PG
                VALUES
                  (IN_CO_CD
                  ,IN_EIGYO_CD
                  ,REC.SHUHAISHIN1_CD
                  ,REC.SHUHAISHIN2_CD
                  ,REC.SHUHAISHIN3_CD
                  ,IN_SHUHAISHIN_SEQ
                  ,TABLE_C(i).BCD_SEQ_NO
                  ,REC.JYUSHIN_YMD
                  ,REC.JYUSHIN_TIME
                  ,IN_JYUSHIN_USER_CD
`;

  let afterInsertBDE = `
                  ,1
                  ,E.FN_削除フラグ('有効')
                  ,SYSTIMESTAMP(3)
                  ,C_USER_ID
                  ,C_PGID
                  ,SYSTIMESTAMP(3)
                  ,C_USER_ID
                  ,C_PGID
                );
              END LOOP;

            TABLE_C.delete;
          END IF; -- フォーマットBCDインサート終了
          WK_FLG            := FALSE;
        END IF;
      END LOOP;

    END; -- 終了テーブルTR_C
`;

  var posOfB = 1;
  var posOfC = 1;
  var posOfD = 1;
  var posOfE = 1;
  for (var i in json_table_WK) {
    var namePhysic = json_table_WK[i].PHY_NM;
    var nameLogic = json_table_WK[i].LOG_NM;
    var digit = json_table_WK[i].DIGIT;
    var firstChar = namePhysic.slice(0, 2);
    var spaceAfterPhysicNm = "                      ".slice(namePhysic.length);

    // thoat vong lap neu gap phai YOBI
    if (firstChar == "Y") {
      break;
    } else if (firstChar == "H_") {
      let subStrb = `:= SUBSTRB(WK_V_WRITCHAR, ${posOfB}, ${digit});`
      let lenSubStrb = posOfB.toString().length + digit.toString().length;
      let spaceAfterSubStrb = "        -- ".slice(lenSubStrb);
      let spaceAfterPhysicNm2 = "                           ".slice(namePhysic.length);

      // subString
      strbB += "              REC." + namePhysic + spaceAfterPhysicNm + subStrb + spaceAfterSubStrb + nameLogic + "\r";

      beforeInsertBDE += "                  ," + namePhysic + spaceAfterPhysicNm2 + "-- " + nameLogic + "\r";
      midInsertBDE += "                  ,REC." + namePhysic + "\r";
      posOfB = posOfB + Number(digit);
    } else if (firstChar == "M_") {
      let subStrb = `:= SUBSTRB(WK_V_WRITCHAR, ${posOfC}, ${digit});`
      let lenSubStrb = posOfC.toString().length + digit.toString().length;
      let spaceAfterSubStrb = "        -- ".slice(lenSubStrb);
      let spaceAfterPhysicNm = "                   ".slice(namePhysic.length);
      let spaceAfterPhysicNm2 = "                           ".slice(namePhysic.length);

      strbC += "              TYPE_C." + namePhysic + spaceAfterPhysicNm + subStrb + spaceAfterSubStrb + nameLogic + "\r";
      beforeInsertBDE += "                  ," + namePhysic + spaceAfterPhysicNm2 + "-- " + nameLogic + "\r";
      midInsertBDE += "                  ,TABLE_C(i)." + namePhysic + "\r";
      posOfC = posOfC + Number(digit);
    } else if (firstChar == "T_") {
      let subStrb = `:= SUBSTRB(WK_V_WRITCHAR, ${posOfD}, ${digit});`
      let lenSubStrb = posOfD.toString().length + digit.toString().length;
      let spaceAfterSubStrb = "        -- ".slice(lenSubStrb);
      let spaceAfterPhysicNm2 = "                           ".slice(namePhysic.length);

      strbD += "              REC." + namePhysic + spaceAfterPhysicNm + subStrb + spaceAfterSubStrb + nameLogic + "\r";
      beforeInsertBDE += "                  ," + namePhysic + spaceAfterPhysicNm2 + "-- " + nameLogic + "\r";
      midInsertBDE += "                  ,REC." + namePhysic + "\r";
      posOfD = posOfD + Number(digit);
    } else if (firstChar == "FT") {
      let subStrb = `:= SUBSTRB(WK_V_WRITCHAR, ${posOfE}, ${digit});`
      let lenSubStrb = posOfE.toString().length + digit.toString().length;
      let spaceAfterSubStrb = "        -- ".slice(lenSubStrb);
      let spaceAfterPhysicNm2 = "                           ".slice(namePhysic.length);

      strbE += "              REC." + namePhysic + spaceAfterPhysicNm + subStrb + spaceAfterSubStrb + nameLogic + "\r";
      beforeInsertFT += "              ," + namePhysic + spaceAfterPhysicNm2 + "-- " + nameLogic + "\r";
      midInsertFT += "              ,REC." + namePhysic + "\r";
      posOfE = posOfE + Number(digit);
    }

  }
  var output = strbB + strbC + strbD + strbE + beforeInsertFT + midInsertFT + afterInsertFT + beforeInsertBDE + midInsertBDE + afterInsertBDE;
  return output;
}