function Compare_To_Declare_BO_A_B_D_E() {
  let output = `

                --■　ﾚｺｰﾄﾞ区分不正チェック　■
                --フォーマットID　A B D E  以外はエラー。
                IF STR_REC_KBN <> 'A' AND STR_REC_KBN <> 'B' AND STR_REC_KBN <> 'D' AND STR_REC_KBN <> 'E' THEN
                    --ｴﾗｰﾌﾗｸﾞをｾｯﾄ
                    OUT_ERR_CD := STR_ERRCD_E10;
                    --ｴﾗｰﾒｯｾｰｼﾞのｾｯﾄ
                    OUT_ERR_MSG := STR_ERRMSG_E10;
                  GOTO ERR;
                ELSIF STR_REC_KBN = 'B' THEN
                  OUT_DENPYO_KENSU          := OUT_DENPYO_KENSU + 1;
                ELSIF STR_REC_KBN = 'D' THEN
                  OUT_MEISAI_KENSU          := OUT_MEISAI_KENSU + 1;
                END IF;

                /********1*********2*********3*********4*********5*********6*********7*********8*********9*********10********11********12********13********14********15********16********
                * ﾚｺｰﾄﾞド区分順序ﾁｪｯｸ    ：PG毎に異なる
                                      ：スタートレコードの次はフォーマットIDがAでなければエラー。
                                      ：フォーマットID Aのレコードの次はBでなければエラー
                                      : フォーマットID Bのレコードの次はDでなければエラー
                                      : フォーマットID Dのレコードの次はD又はEでなければエラー
                                      : フォーマットID Eのレコードの次はA又Bでなければエラー
                ********1*********2*********3*********4*********5*********6*********7*********8*********9*********10********11********12********13********14********15********16********/
                --■　レコード区分順序チェック　■
                --スタートレコードの次はフォーマットIDがAでなければエラー。
                IF STR_START = PKG_BATCH_CONST.OF_CONST('START') THEN
                  IF STR_REC_KBN <> 'A' THEN
                    --ｴﾗｰﾌﾗｸﾞをｾｯﾄ
                    OUT_ERR_CD := STR_ERRCD_E11;
                    --ｴﾗｰﾒｯｾｰｼﾞのｾｯﾄ
                    OUT_ERR_MSG := STR_ERRMSG_E11;
                    GOTO ERR;
                  END IF;
                    --スタート区分に空白をｾｯﾄ
                    STR_START := '';
                --フォーマットID Aのレコードの次はBでなければエラー
                ELSIF STR_ZEN_REC_KBN = 'A' THEN

                  IF STR_REC_KBN <> 'B' THEN
                    --ｴﾗｰﾌﾗｸﾞをｾｯﾄ
                    OUT_ERR_CD := STR_ERRCD_E11;
                    --ｴﾗｰﾒｯｾｰｼﾞのｾｯﾄ
                    OUT_ERR_MSG := STR_ERRMSG_E11;
                    GOTO ERR;
                  END IF;
                ELSIF STR_ZEN_REC_KBN = 'B' THEN
                  IF STR_REC_KBN <> 'D' THEN
                    --ｴﾗｰﾌﾗｸﾞをｾｯﾄ
                    OUT_ERR_CD := STR_ERRCD_E11;
                    --ｴﾗｰﾒｯｾｰｼﾞのｾｯﾄ
                    OUT_ERR_MSG := STR_ERRMSG_E11;
                    GOTO ERR;
                  END IF;
                ELSIF STR_ZEN_REC_KBN = 'D' THEN
                  IF STR_REC_KBN <> 'D' AND STR_REC_KBN <> 'E' THEN
                    --ｴﾗｰﾌﾗｸﾞをｾｯﾄ
                    OUT_ERR_CD := STR_ERRCD_E11;
                    --ｴﾗｰﾒｯｾｰｼﾞのｾｯﾄ
                    OUT_ERR_MSG := STR_ERRMSG_E11;
                    GOTO ERR;
                    END IF;
                ELSIF STR_ZEN_REC_KBN = 'E' THEN
                  IF STR_REC_KBN <> 'A' AND STR_REC_KBN <> 'B' AND SUBSTRB(WK_V_WRITCHAR, 1, 5) <> STR_END THEN
                    --ｴﾗｰﾌﾗｸﾞをｾｯﾄ
                    OUT_ERR_CD := STR_ERRCD_E11;
                    --ｴﾗｰﾒｯｾｰｼﾞのｾｯﾄ
                    OUT_ERR_MSG := STR_ERRMSG_E11;
                    GOTO ERR;
                  END IF;
                END IF;

            END IF;

            --前ﾚｺｰﾄﾞ区分のセット
            STR_ZEN_REC_KBN := STR_REC_KBN;

        END IF;

    END LOOP;

    --ｵﾝﾗｲﾝ受信ﾌｧｲﾙを閉じる
    IF UTL_FILE.IS_OPEN(WK_FILE_HANDLE) = TRUE THEN
        UTL_FILE.FCLOSE(WK_FILE_HANDLE);
    END IF;

    --ｽﾀｰﾄﾚｺｰﾄﾞのﾚｺｰﾄﾞ区分を取得 → ('START')
    STR_START         := PKG_BATCH_CONST.OF_CONST('START');

    -- ｵﾝﾗｲﾝ受信ﾌｧｲﾙを開く
    IF UTL_FILE.IS_OPEN(WK_FILE_HANDLE) = FALSE THEN
        -- ファイルリストオープン
        WK_FILE_HANDLE := UTL_FILE.FOPEN(WK_V_PATH,IN_FILE_NM, 'R');
    END IF;

    --■　再度、ｵﾝﾗｲﾝ受信ファイルを順に読込み、ｵﾝﾗｲﾝ受注伝票①の登録を行う　■
    REC.WORKSHUHAISHIN_SEQ_NO := 0; --カウントフォーマットA
`;
  return output;
}

function Declare_To_SubStrbL_BO_A_B_D_E(json_table_WK) {
  let declare = `
    -- フォーマットDの型宣言
    DECLARE TYPE D_REC IS RECORD (
        BDE_SEQ_NO NUMBER := 1, -- カウントフォーマットABDE
`;
  let afterDeclare = `
    -- テーブルTR_Dの型を追加する
    TYPE TR_D IS TABLE OF D_REC;
      TABLE_D TR_D := TR_D();
      TYPE_D D_REC;
    BEGIN
`
  for (var i in json_table_WK) {
    var firstChar = json_table_WK[i].PHY_NM.slice(0, 1);
    if (firstChar == "M") {
      let phyNm = json_table_WK[i].PHY_NM;
      let spaceAfterPhysicNm = "                            ".slice(phyNm.length);
      let digit = json_table_WK[i].DIGIT;
      let spaceAfterVarchar2 = "          ".slice(digit.toString().length);

      declare += "        " + phyNm + spaceAfterPhysicNm + "VARCHAR2(" + json_table_WK[i].DIGIT + ")," + spaceAfterVarchar2 + "-- " + json_table_WK[i].LOG_NM + "\r";
    } else if (firstChar == "Y") {
      break;
    }
  }

  // thay dau "," cuoi cung thanh ";"
  lastComma = declare.lastIndexOf(',');
  declare = declare.substr(0, lastComma) + ');' + declare.substr(lastComma + 2);
  let output = declare + afterDeclare;

  return output;
}

function SubStrbA_To_SubStrbBDE_BO_A_B_D_E(json_table_WK ,namePhysicTableWK) {
  let SubStrb = `
    LOOP UTL_FILE.GET_LINE(WK_FILE_HANDLE, WK_V_WRITCHAR);

      -- エンドレコードのレコード区分（'END'）になるまで処理を行う
      EXIT WHEN SUBSTRB(WK_V_WRITCHAR,1,5) = STR_END;

        -- 1ﾚｺｰﾄﾞがすべて空白以外のﾁｪｯｸを行う
        IF TRIM(WK_V_WRITCHAR) IS NOT NULL THEN

          -- レコード区分を変数に代入
          STR_REC_KBN := TRIM(SUBSTRB(WK_V_WRITCHAR, 1, 1));

          IF TRIM(SUBSTRB(WK_V_WRITCHAR,1,5)) = STR_START THEN
            -- ｽﾀｰﾄﾚｺｰﾄﾞ
            REC.SHUHAISHIN1_CD            := SUBSTRB(WK_V_WRITCHAR,  6, 5);       -- 集配信一次店CD
            REC.SHUHAISHIN2_CD            := SUBSTRB(WK_V_WRITCHAR, 11, 4);       -- 集配信二次店CD
            REC.SHUHAISHIN3_CD            := SUBSTRB(WK_V_WRITCHAR, 15, 4);       -- 集配信三次店CD
            REC.JYUSHIN_YMD               := SUBSTRB(WK_V_WRITCHAR, 23, 8);       -- 受信日
            REC.JYUSHIN_TIME              := SUBSTRB(WK_V_WRITCHAR, 31, 6);       -- 受信時刻

          -- 伝票明細（A）
          ELSIF STR_REC_KBN = 'A' THEN
            REC.WORKSHUHAISHIN_SEQ_NO     := REC.WORKSHUHAISHIN_SEQ_NO + 1;
`;

  let beforeInsert = `

            --フォーマットAでテーブル${namePhysicTableWK}に挿入
            INSERT INTO ${namePhysicTableWK}
              (CO_CD
              ,EIGYO_CD
              ,SHUHAISHIN1_CD
              ,SHUHAISHIN2_CD
              ,SHUHAISHIN3_CD
              ,SHUHAISHIN_SEQ
              ,WORKSHUHAISHIN_SEQ_NO
              ,JYUSHIN_YMD
              ,JYUSHIN_TIME
              ,JYUSHIN_USER_CD
`;

  let midInsert = `
              ,UPD_CNT
              ,DEL_FLG
              ,INS_DATETIME
              ,INS_USER_CD
              ,INS_PG
              ,UPD_DATETIME
              ,UPD_USER_CD
              ,UPD_PG)
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

  let afterInsert = `
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
      let spaceAfterPhysicNm = "                      ".slice(phyNm.length);
      let digit = json_table_WK[i].DIGIT;
      let subStrb = `:= SUBSTRB(WK_V_WRITCHAR, ${pos}, ${digit});`
      let logicNm = json_table_WK[i].LOG_NM;
      let lenSubStrb = pos.toString().length + digit.toString().length;
      let spaceAfterSubStrb = "              -- ".slice(lenSubStrb);

      SubStrb += "            REC." + phyNm + spaceAfterPhysicNm + subStrb + spaceAfterSubStrb + logicNm + "\r";
      beforeInsert += "              ," + phyNm + "\r";
      midInsert += "              ,REC." + phyNm + "\r";
      pos = pos + Number(digit);
    } else if (firstChar == "H") {
      break;
    }
  }
  let output = SubStrb + beforeInsert + midInsert + afterInsert;
  return output;
}