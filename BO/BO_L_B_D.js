function Compare_To_Declare_BO_L_B_D() {
  let output = `

                --■　ﾚｺｰﾄﾞ区分不正チェック　■
                --フォーマットID　C D H 以外はエラー。
                IF STR_REC_KBN <> 'L' AND STR_REC_KBN <> 'B' AND STR_REC_KBN <> 'D' THEN
                    --ｴﾗｰﾌﾗｸﾞをｾｯﾄ
                    OUT_ERR_CD := STR_ERRCD_E10;
                    --ｴﾗｰﾒｯｾｰｼﾞのｾｯﾄ
                    OUT_ERR_MSG := STR_ERRMSG_E10;
                  GOTO ERR;
                ELSIF STR_REC_KBN = 'B' THEN
                     OUT_DENPYO_KENSU          := OUT_DENPYO_KENSU + 1;                -- 伝票枚数
                ELSIF STR_REC_KBN = 'D' THEN
                     OUT_MEISAI_KENSU          := OUT_MEISAI_KENSU + 1;                -- 明細件数
                END IF;

                /********1*********2*********3*********4*********5*********6*********7*********8*********9*********10********11********12********13********14********15********16********
                * ﾚｺｰﾄﾞド区分順序ﾁｪｯｸ    ：PG毎に異なる
                                      ： スタートレコードの次はレコード（R）区分がLでなければエラー。
                                      ： レコード（R）区分 Lのレコードの次はBでなければエラー
                                      : レコード（R）区分 Bのレコードの次はDでなければエラー
                                      : レコード（R）区分 Dのレコードの次はL 、B又はENDレコードでなければエラー
                ********1*********2*********3*********4*********5*********6*********7*********8*********9*********10********11********12********13********14********15********16********/
                --■　レコード区分順序チェック　■
                --スタートレコードの次はフォーマットIDがAでなければエラー。
                IF STR_REC_KBN = E.OF_CONST('START') THEN
                  IF STR_REC_KBN <> 'L' THEN
                    --ｴﾗｰﾌﾗｸﾞをｾｯﾄ
                    OUT_ERR_CD := STR_ERRCD_E11;
                    --ｴﾗｰﾒｯｾｰｼﾞのｾｯﾄ
                    OUT_ERR_MSG := STR_ERRMSG_E11;
                    GOTO ERR;
                  END IF;
                    --スタート区分に空白をｾｯﾄ
                    STR_START := '';
                    STR_ZEN_REC_KBN := STR_REC_KBN;
                --フォーマットID Aのレコードの次はBでなければエラー
                ELSIF STR_ZEN_REC_KBN = 'L' THEN
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
                  IF STR_REC_KBN <> 'D' AND STR_REC_KBN <> 'L' AND STR_REC_KBN <> 'B' AND SUBSTRB(WK_V_WRITCHAR, 1, 5) <> STR_END THEN
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
    STR_START         := E.OF_CONST('START');

    -- ｵﾝﾗｲﾝ受信ﾌｧｲﾙを開く
    IF UTL_FILE.IS_OPEN(WK_FILE_HANDLE) = FALSE THEN
        -- ファイルリストオープン
        WK_FILE_HANDLE := UTL_FILE.FOPEN(WK_V_PATH,IN_FILE_NM, 'R');
    END IF;

    --■　再度、ｵﾝﾗｲﾝ受信ファイルを順に読込み、ｵﾝﾗｲﾝ受注伝票①の登録を行う　■
    REC.WORKSHUHAISHIN_SEQ_NO := 0; --カウントフォーマットL
`;
  return output;
}

function Declare_To_SubStrbL_BO_L_B_D(json_table_WK) {
  let declare = `
    -- フォーマットDの型宣言
    DECLARE TYPE  D_REC IS RECORD (
        HD_SEQ_NO NUMBER := 1,--カウントフォーマットBD
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
    }
  }

  // thay dau "," cuoi cung thanh ";"
  lastComma = declare.lastIndexOf(',');
  declare = declare.substr(0, lastComma) + ');' + declare.substr(lastComma + 2);
  let output = declare + afterDeclare;

  return output;
}

function SubStrbL_To_SubStrbBD_BO_L_B_D(json_table_WK) {
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
            REC.SHUHAISHIN1_CD        := SUBSTRB(WK_V_WRITCHAR,  6, 5);           -- 集配信一次店CD
            REC.SHUHAISHIN2_CD        := SUBSTRB(WK_V_WRITCHAR, 11, 4);           -- 集配信二次店CD
            REC.SHUHAISHIN3_CD        := SUBSTRB(WK_V_WRITCHAR, 15, 4);           -- 集配信三次店CD
            REC.JYUSHIN_YMD           := SUBSTRB(WK_V_WRITCHAR, 23, 8);           -- 受信日
            REC.JYUSHIN_TIME          := SUBSTRB(WK_V_WRITCHAR, 31, 6);           -- 受信時刻

          --伝票明細（L）
          ELSIF STR_REC_KBN = 'L' THEN
            REC.WORKSHUHAISHIN_SEQ_NO := REC.WORKSHUHAISHIN_SEQ_NO + 1;
`;

  let insert1 = `

          --フォーマットLでテーブルWK_E_ORD_DAISHO_VANに挿入
          INSERT INTO WK_E_ORD_DAISHO_VAN
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

  let insert2 = `
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

    if (firstChar == "L") {
      let phyNm = json_table_WK[i].PHY_NM;
      let spaceAfterPhysicNm = "                      ".slice(phyNm.length);
      let digit = json_table_WK[i].DIGIT;
      let subStrb = `:= SUBSTRB(WK_V_WRITCHAR, ${pos}, ${digit});`
      let logicNm = json_table_WK[i].LOG_NM;
      let lenSubStrb = pos.toString().length + digit.toString().length;
      let spaceAfterSubStrb = "              -- ".slice(lenSubStrb);

      SubStrb += "            REC." + phyNm + spaceAfterPhysicNm + subStrb + spaceAfterSubStrb + logicNm + "\r";
      insert1 += "            ," + phyNm + "\r";
      insert2 += "            ,REC." + phyNm + "\r";
      pos = pos + Number(digit);
    } else if (firstChar == "D") {
      break;
    }
  }
  let output = SubStrb + insert1 + insert2 + insert3;
  return output;
}

function SubStrbBD_To_Insert_T_REL_BO_L_B_D(json_table_WK, namePhysicTableWK) {
  let strbB = `
          --伝票明細（B）
          ELSIF STR_REC_KBN = 'B' THEN
`;

  let strbD = `

          --伝票明細（D）
          ELSIF STR_REC_KBN = 'D' THEN
            TYPE_D.HD_SEQ_NO               := REC.WORKSHUHAISHIN_SEQ_NO + 1;           --フォーマットBDにSEQ_NOを設定
            REC.WORKSHUHAISHIN_SEQ_NO      := TYPE_D.HD_SEQ_NO;                        --フォーマットCの連続カウント
            STR_COUNT                       := STR_COUNT + 1;
`;

  let beforeInsert = `
            TABLE_D.extend;
            TABLE_D(STR_COUNT) := TYPE_D;

            WK_FLG                    := TRUE;
            STR_COUNT                  := 0;

           END IF;

          --フォーマットHDのデータを挿入
          IF WK_FLG THEN
            FOR i IN TABLE_D.FIRST .. TABLE_D.LAST
              LOOP
                INSERT INTO ${namePhysicTableWK}
                  (CO_CD                    -- 会社コード
                  ,EIGYO_CD                 -- 営業所コード
                  ,SHUHAISHIN1_CD           -- 集配信コード（一次店）
                  ,SHUHAISHIN2_CD           -- 集配信コード（二次店）
                  ,SHUHAISHIN3_CD           -- 集配信コード（三次店）
                  ,SHUHAISHIN_SEQ           -- 集配信連番
                  ,WORKSHUHAISHIN_SEQ_NO    -- ワークSEQ_NO
                  ,JYUSHIN_YMD              -- 受信日
                  ,JYUSHIN_TIME             -- 受信時刻
                  ,JYUSHIN_USER_CD          -- 受信者CD
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
                  ,TABLE_D(i).HD_SEQ_NO
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
              END LOOP;
            -- インデックスを設定するためにテーブルを削除する
            TABLE_D.delete;

            END IF; --終了挿入フォーマットBD
            WK_FLG            := FALSE;

        END IF;
    END LOOP;

    END; -- 終了テーブルtr_d
`

  var posOfB = 1;
  var posOfD = 1;
  for (var i in json_table_WK) {
    var firstChar = json_table_WK[i].PHY_NM.slice(0, 1);

    // thoat vong lap neu gap phai YOBI
    if (firstChar == "Y") {
      break;
    } else if (firstChar == "D") {
      let namePhysic = json_table_WK[i].PHY_NM;
      let nameLogic = json_table_WK[i].LOG_NM;
      let spaceAfterPhysicNm = "                         ".slice(namePhysic.length);

      let digit = json_table_WK[i].DIGIT;
      let subStrb = `:= SUBSTRB(WK_V_WRITCHAR, ${posOfB}, ${digit});`
      let logicNm = json_table_WK[i].LOG_NM;
      let lenSubStrb = posOfB.toString().length + digit.toString().length;
      let spaceAfterSubStrb = "        -- ".slice(lenSubStrb);

      strbB += "            REC." + namePhysic + spaceAfterPhysicNm + subStrb + spaceAfterSubStrb + logicNm + "\r";
      beforeInsert += "                  ," + namePhysic + spaceAfterPhysicNm + "-- " + nameLogic + "\r";
      midInsert += "                  ,REC." + namePhysic + "\r";
      posOfB = posOfB + Number(digit);
    } else if (firstChar == "M") {
      let namePhysic = json_table_WK[i].PHY_NM;
      let nameLogic = json_table_WK[i].LOG_NM;
      let spaceAfterPhysicNm = "                         ".slice(namePhysic.length);

      let digit = json_table_WK[i].DIGIT;
      let subStrb = `:= SUBSTRB(WK_V_WRITCHAR, ${posOfD}, ${digit});`
      let logicNm = json_table_WK[i].LOG_NM;
      let lenSubStrb = posOfD.toString().length + digit.toString().length;
      let spaceAfterSubStrb = "        -- ".slice(lenSubStrb);

      strbD += "            TYPE_D." + namePhysic + spaceAfterPhysicNm + subStrb + spaceAfterSubStrb + logicNm + "\r";
      beforeInsert += "                  ," + namePhysic + spaceAfterPhysicNm + "-- " + nameLogic + "\r";
      midInsert += "                  ,TABLE_D(i)." + namePhysic + "\r";
      posOfD = posOfD + Number(digit);
    }

  }
  output = strbB + strbD + beforeInsert + midInsert + afterInsert;
  return output
}