function Start_To_Substrb_BO_Line_Blank(namePKG, nameJapanOfPkg, namePhysicTableWK) {
  var dateObj = new Date();
  var month = dateObj.getUTCMonth() + 1; //months from 1-12
  var day = dateObj.getUTCDate();
  month < 10 ? month = "0" + month.toString() : month;
  day < 10 ? day = "0" + day.toString() : day;
  var year = dateObj.getUTCFullYear();

  var dateNow = year + "/" + month + "/" + day;

  msgERRCD = namePKG.slice(2, 5);

  let output = `
CREATE OR REPLACE PACKAGE PKG_${namePKG} AS
/********************************************************************************************
 * 名称   ：${nameJapanOfPkg}（パッケージ定義）                                                        *
 * 作成日 ： ${dateNow}                                                                      *
 * 作成者 ： Rikkei                                                                          *
 * 更新日 ：                                                                                 *
 * 更新者 ：                                                                                 *
********************************************************************************************/

  PROCEDURE PR_GET_${namePKG} (
     IN_CO_CD                      IN VARCHAR2                    -- 会社コード
    ,IN_EIGYO_CD                   IN VARCHAR2                    -- 営業所コード
    ,IN_JYUSHIN_USER_CD            IN VARCHAR2                    -- 受信者コード
    ,IN_FILE_NM                    IN VARCHAR2                    -- ﾌｧｲﾙ名
    ,IN_SHUHAISHIN_SEQ             IN NUMBER                      -- 集配信連番

    ,OUT_DATA_KENSU                OUT NUMBER                     -- データ件数
    ,OUT_DENPYO_KENSU              OUT NUMBER                     -- 伝票枚数
    ,OUT_MEISAI_KENSU              OUT NUMBER                     -- 明細件数
    ,OUT_ERR_CD                    OUT VARCHAR2                   -- ｴﾗｰｺｰﾄﾞ
    ,OUT_ERR_MSG                   OUT VARCHAR2                   -- ｴﾗｰﾒｯｾｰｼﾞ
  );

END PKG_${namePKG};
/

CREATE OR REPLACE PACKAGE BODY PKG_${namePKG} AS
/********************************************************************************************
 * 名称   ： ${nameJapanOfPkg}（パッケージ本体）                                                        *
 * 作成日 ： ${dateNow}                                                                      *
 * 作成者 ： Rikkei                                                                          *
 * 更新日 ：                                                                                 *
 * 更新者 ：                                                                                 *
********************************************************************************************/

  -- ${nameJapanOfPkg}
  PROCEDURE PR_GET_${namePKG} (
     IN_CO_CD                      IN  VARCHAR2                   -- 会社コード
    ,IN_EIGYO_CD                   IN  VARCHAR2                   -- 営業所コード
    ,IN_JYUSHIN_USER_CD            IN  VARCHAR2                   -- 受信者コード
    ,IN_FILE_NM                    IN  VARCHAR2                   -- ﾌｧｲﾙ名
    ,IN_SHUHAISHIN_SEQ             IN  NUMBER                     -- 集配信連番

    ,OUT_DATA_KENSU                OUT NUMBER                     -- データ件数
    ,OUT_DENPYO_KENSU              OUT NUMBER                     -- 伝票枚数
    ,OUT_MEISAI_KENSU              OUT NUMBER                     -- 明細件数
    ,OUT_ERR_CD                    OUT VARCHAR2                   -- ｴﾗｰｺｰﾄﾞ
    ,OUT_ERR_MSG                   OUT VARCHAR2                   -- ｴﾗｰﾒｯｾｰｼﾞ
  ) IS

    /* 定数 ---------------------------------------------------------------------*/
    C_PGID                CONSTANT VARCHAR2(30) := '${namePKG}';
    C_USER_ID             CONSTANT VARCHAR2(30) := E.OF_CONST('BATCH_ID');

    -- 他プロシージャ呼び出し用
    WK_FILE_HANDLE        UTL_FILE.FILE_TYPE;                             -- ファイルハンドル
    WK_V_PATH             VARCHAR2(256);                                  -- ファイルパス
    WK_V_WRITCHAR         VARCHAR2(32000)       := '';                    -- データ
    STR_END               CHAR(5)               := E.OF_CONST('END');     -- ｴﾝﾄﾞﾚｺｰﾄﾞ：ｴﾝﾄﾞﾚｺｰﾄﾞのﾚｺｰﾄﾞ区分を取得 → 'END'
    STR_START             CHAR(5)               := E.OF_CONST('START');   -- ｽﾀｰﾄﾚｺｰﾄﾞ：ｽﾀｰﾄﾚｺｰﾄﾞのﾚｺｰﾄﾞ区分を取得 → 'START'
    REC_WK                ${namePhysicTableWK}%ROWTYPE;

  /* =================================================================
    処理開始
  ================================================================== */
  BEGIN
    -- << 初期値設定 >> ---------------------------------------------
    OUT_DATA_KENSU        := 0;
    OUT_DENPYO_KENSU      := 0;
    OUT_MEISAI_KENSU      := 0;
    OUT_ERR_CD            := '';
    OUT_ERR_MSG           := '';

    --ﾌｧｲﾙﾊﾟｽの取得
    WK_V_PATH := E.OF_CONST('HB_JYUCHU_DIR');
    -- << データ取得 >> ---------------------------------------------
    -- ｵﾝﾗｲﾝ受信ﾌｧｲﾙを開く
    IF UTL_FILE.IS_OPEN(WK_FILE_HANDLE) = FALSE THEN
      -- ファイルリストオープン
      WK_FILE_HANDLE := UTL_FILE.FOPEN(WK_V_PATH, IN_FILE_NM, 'R');
    END IF;
    --■　ｵﾝﾗｲﾝ受信ファイルを順に読込み、ﾚｺｰﾄﾞ区分（ｴﾝﾄﾞﾚｺｰﾄﾞ、ｽﾀｰﾄﾚｺｰﾄﾞ、1ﾚｺｰﾄﾞがすべて空白以外）のﾁｪｯｸを行う　■
    LOOP UTL_FILE.GET_LINE(WK_FILE_HANDLE, WK_V_WRITCHAR);
      -- エンドレコードのレコード区分（'END  '）になるまで処理を行う
      EXIT WHEN SUBSTRB(WK_V_WRITCHAR, 1, 5) = STR_END;
      -- 1ﾚｺｰﾄﾞがすべて空白以外のﾁｪｯｸを行う
      IF TRIM(WK_V_WRITCHAR) IS NOT NULL THEN
        -- ｽﾀｰﾄﾚｺｰﾄﾞのレコード区分（'START'）以外のﾁｪｯｸを行う
        IF TRIM(SUBSTRB(WK_V_WRITCHAR, 1, 5)) <> STR_START THEN
          -- レコード件数をカウントする。
          OUT_DATA_KENSU := OUT_DATA_KENSU + 1;
        END IF;
      END IF;
    END LOOP;

    -- ｵﾝﾗｲﾝ受信ﾌｧｲﾙを閉じる
    IF UTL_FILE.IS_OPEN(WK_FILE_HANDLE) = TRUE THEN
      UTL_FILE.FCLOSE(WK_FILE_HANDLE);
    END IF;

    -- ｵﾝﾗｲﾝ受信ﾌｧｲﾙを開く
    IF UTL_FILE.IS_OPEN(WK_FILE_HANDLE) = FALSE THEN
      -- ファイルリストオープン
      WK_FILE_HANDLE := UTL_FILE.FOPEN(WK_V_PATH,IN_FILE_NM, 'R');
    END IF;

    --■　再度、ｵﾝﾗｲﾝ受信ファイルを順に読込み、ｵﾝﾗｲﾝ受注伝票①の登録を行う　■
    REC_WK.WORKSHUHAISHIN_SEQ_NO := 0; --カウントフォーマットL`;

  return output;
}

function SubStrb_To_Insert_WK_BO_Line_Blank(json_table_WK) {
  let output = `
    LOOP UTL_FILE.GET_LINE(WK_FILE_HANDLE, WK_V_WRITCHAR);
      -- エンドレコードのレコード区分（'END  '）になるまで処理を行う
      EXIT WHEN SUBSTRB(WK_V_WRITCHAR, 1, 5) = STR_END;
      -- 1ﾚｺｰﾄﾞがすべて空白以外のﾁｪｯｸを行う
      IF TRIM(WK_V_WRITCHAR) IS NOT NULL THEN
        IF TRIM(SUBSTRB(WK_V_WRITCHAR,1,5)) = STR_START THEN
          -- ｽﾀｰﾄﾚｺｰﾄﾞ
          REC_WK.SHUHAISHIN1_CD            := SUBSTRB(WK_V_WRITCHAR,  6, 5);                            -- 集配信一次店CD
          REC_WK.SHUHAISHIN2_CD            := SUBSTRB(WK_V_WRITCHAR, 11, 4);                            -- 集配信二次店CD
          REC_WK.SHUHAISHIN3_CD            := SUBSTRB(WK_V_WRITCHAR, 15, 4);                            -- 集配信三次店CD
          REC_WK.JYUSHIN_YMD               := SUBSTRB(WK_V_WRITCHAR, 23, 8);                            -- 受信日
          REC_WK.JYUSHIN_TIME              := SUBSTRB(WK_V_WRITCHAR, 31, 6);                            -- 受信時刻
        ELSE
          REC_WK.WORKSHUHAISHIN_SEQ_NO     := REC_WK.WORKSHUHAISHIN_SEQ_NO + 1;
`;
  var x = 0;
  var y = 0;
  for (var i in json_table_WK) {
    var firstChar = json_table_WK[i].PHY_NM.slice(0, 4);
    x++;
    if (firstChar == "YOBI") {
      break;
    } else if (x > 10) {
      y++;
      let phyNm = json_table_WK[i].PHY_NM;
      let spaceAfterPhysicNm = "                          ".slice(phyNm.length);
      let subStrb = `:= PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_V_WRITCHAR, ${y});`
      let logicNm = json_table_WK[i].LOG_NM;
      let spaceAfterSubStrb = "         -- ".slice(y.toString().length);

      output += "          REC_WK." + phyNm + spaceAfterPhysicNm + subStrb + spaceAfterSubStrb + "-- " + logicNm + "\r";
    }
  }
  return output;
}

function Insert_WK_To_T_REL_BO_Line_Blank(json_table_WK ,namePhysicTableWK) {
  let beforeInsert = `
          -- テーブル${namePhysicTableWK}に挿入
          INSERT INTO ${namePhysicTableWK}
            (CO_CD                           -- 会社コード
            ,EIGYO_CD                        -- 営業所コード
            ,SHUHAISHIN1_CD                  -- 集配信コード（一次店）
            ,SHUHAISHIN2_CD                  -- 集配信コード（二次店）
            ,SHUHAISHIN3_CD                  -- 集配信コード（三次店）
            ,SHUHAISHIN_SEQ                  -- 集配信連番
            ,WORKSHUHAISHIN_SEQ_NO           -- ワークSEQ_NO
            ,JYUSHIN_YMD                     -- 受信日
            ,JYUSHIN_TIME                    -- 受信時刻
            ,JYUSHIN_USER_CD                 -- 受信者CD

`;

  let midInsert =`

            ,UPD_CNT                         -- 更新回数
            ,DEL_FLG                         -- 削除フラグ
            ,INS_DATETIME                    -- 登録日時
            ,INS_USER_CD                     -- 登録者(CD)
            ,INS_PG                          -- 登録PG
            ,UPD_DATETIME                    -- 更新日時
            ,UPD_USER_CD                     -- 更新者(CD)
            ,UPD_PG)                         -- 更新PG
          VALUES
            (IN_CO_CD
            ,IN_EIGYO_CD
            ,REC_WK.SHUHAISHIN1_CD
            ,REC_WK.SHUHAISHIN2_CD
            ,REC_WK.SHUHAISHIN3_CD
            ,IN_SHUHAISHIN_SEQ
            ,REC_WK.WORKSHUHAISHIN_SEQ_NO
            ,REC_WK.JYUSHIN_YMD
            ,REC_WK.JYUSHIN_TIME
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
        END IF;
      END IF;
    END LOOP;

  /********1*********2*********3*********4*********5*********6*********7*********8*********9*********10********11********12********13********14********15********16********
    * エラー処理    ：共通仕様の為、変更しないでくさい
    ********1*********2*********3*********4*********5*********6*********7*********8*********9*********10********11********12********13********14********15********16********/
    <<ERR>>
    -- ｵﾝﾗｲﾝ受信ﾌｧｲﾙを閉じる
    IF UTL_FILE.IS_OPEN(WK_FILE_HANDLE) = TRUE THEN
      UTL_FILE.FCLOSE(WK_FILE_HANDLE);
    END IF;
`;
  var x = 0;
  for (var i in json_table_WK) {
    var firstChar = json_table_WK[i].PHY_NM.slice(0, 4);
    x++;
    if (firstChar == "YOBI") {
      break;
    } else if (x > 10) {
      let phyNm = json_table_WK[i].PHY_NM;
      let spaceAfterPhysicNm = "                                ".slice(phyNm.length);
      let logicNm = json_table_WK[i].LOG_NM;

      beforeInsert += "            ," + phyNm + spaceAfterPhysicNm + "-- " + logicNm + "\r";
      midInsert += "            ,REC_WK." + phyNm + "\r";
    }
  }
  return output = beforeInsert + midInsert + afterInsert;
}

function Insert_T_REL_To_End_BO_Line_Blank (parse_json_mapping, json_table_T_REL, namePhysicTableT_REL, namePhysicTableWK, namePKG) {
  var outputInsert = `
    -- ${namePhysicTableWK}から${namePhysicTableT_REL}を挿入する
    INSERT INTO ${namePhysicTableT_REL}
      (CO_CD                      -- 会社コード
      ,EIGYO_CD                   -- 営業所コード
      ,SHUHAISHIN1_CD             -- 集配信コード（一次店）
      ,SHUHAISHIN2_CD             -- 集配信コード（二次店）
      ,SHUHAISHIN3_CD             -- 集配信コード（三次店）
      ,SHUHAISHIN_SEQ             -- 集配信連番
      ,SHUHAISHIN_SEQ_NO          -- 集配信連番内SEQ
      ,JYUSHIN_YMD                -- 受信日
      ,JYUSHIN_TIME               -- 受信時刻
      ,JYUSHIN_USER_CD            -- 受信者CD

`;
  var outputSelect = `

      ,UPD_CNT                    -- 更新回数
      ,DEL_FLG                    -- 削除フラグ
      ,INS_DATETIME               -- 登録日時
      ,INS_USER_CD                -- 登録者(CD)
      ,INS_PG                     -- 登録PG
      ,UPD_DATETIME               -- 更新日時
      ,UPD_USER_CD                -- 更新者(CD)
      ,UPD_PG                     -- 更新PG
      )
    SELECT
       CO_CD                                         AS           CO_CD
      ,EIGYO_CD                                      AS           EIGYO_CD
      ,SHUHAISHIN1_CD                                AS           SHUHAISHIN1_CD
      ,SHUHAISHIN2_CD                                AS           SHUHAISHIN2_CD
      ,SHUHAISHIN3_CD                                AS           SHUHAISHIN3_CD
      ,SHUHAISHIN_SEQ                                AS           SHUHAISHIN_SEQ
      ,WORKSHUHAISHIN_SEQ_NO                         AS           SHUHAISHIN_SEQ_NO
      ,JYUSHIN_YMD                                   AS           JYUSHIN_YMD
      ,JYUSHIN_TIME                                  AS           JYUSHIN_TIME
      ,JYUSHIN_USER_CD                               AS           JYUSHIN_USER_CD

`;

  var outputWhere = `

      ,1
      ,E.FN_削除フラグ('有効')
      ,SYSTIMESTAMP(3)
      ,IN_JYUSHIN_USER_CD
      ,C_PGID
      ,SYSTIMESTAMP(3)
      ,IN_JYUSHIN_USER_CD
      ,C_PGID
    FROM ${namePhysicTableWK}
    WHERE CO_CD          = IN_CO_CD
      AND EIGYO_CD       = IN_EIGYO_CD
      AND SHUHAISHIN_SEQ = IN_SHUHAISHIN_SEQ
    ORDER BY WORKSHUHAISHIN_SEQ_NO;

    -- 戻り値・伝票枚数と明細件数をセットする。
    SELECT COUNT(DISTINCT TORIH_TORI_NO), COUNT(TORI_MEISAI_NO)
    INTO OUT_DENPYO_KENSU, OUT_MEISAI_KENSU
    FROM ${namePhysicTableWK}
    WHERE CO_CD          = IN_CO_CD
      AND EIGYO_CD       = IN_EIGYO_CD
      AND SHUHAISHIN_SEQ = IN_SHUHAISHIN_SEQ;

    -- 終了
    RETURN;

    EXCEPTION
      WHEN OTHERS THEN
        -- ｵﾝﾗｲﾝ受信ﾌｧｲﾙを閉じる
        IF UTL_FILE.IS_OPEN(WK_FILE_HANDLE) = TRUE THEN
          UTL_FILE.FCLOSE(WK_FILE_HANDLE);
        END IF;
        DBMS_OUTPUT.PUT_LINE('CODE:'||SQLCODE);
        DBMS_OUTPUT.PUT_LINE('EMSG:'||SQLERRM);
        -- 例外ｴﾗｰが発生した場合は、ｴﾗｰﾌﾗｸﾞに'E99'、ｴﾗｰﾒｯｾｰｼﾞに'CODE:'||SQLCODE || 'EMSG:'||SQLERRMをセットする
        -- ｴﾗｰﾌﾗｸﾞのｾｯﾄ
        OUT_ERR_CD  := 'E99';
        -- ｴﾗｰﾒｯｾｰｼﾞのｾｯﾄ
        OUT_ERR_MSG := 'CODE:'||SQLCODE || 'EMSG:'||SQLERRM ;

  END PR_GET_${namePKG};

END PKG_${namePKG};
/`;
  let len_array = parse_json_mapping.length;
  let x = 18; // vi tri cot nam sau RE_CHK_TIME_USER_CD
  for (x; x < len_array; x++) {
    len = Object.keys(parse_json_mapping[x]).length; // chi lay ra nhung o da mapping la OK
    if (len > 3) {

      // lay ra cot can insert cua ban T_REL
      var keyOfNmPhysicColumnTableT_REL = Object.keys(parse_json_mapping[x])[1];
      var nmPhysicColumnTableT_REL = parse_json_mapping[x][keyOfNmPhysicColumnTableT_REL];  // ten vat ly cua t_rel
      var keyOfComment = Object.keys(parse_json_mapping[x])[0];
      var Comment = parse_json_mapping[x][keyOfComment];                // ten logic cua t_rel
      let spaceBeforeComment = "                           ".slice(nmPhysicColumnTableT_REL.length);
      outputInsert += "      ," + nmPhysicColumnTableT_REL + spaceBeforeComment + "-- " + Comment + "\r";

      // lay ra cot cua bang WK de insert vao bang T_REl
      var keyOfNameTableWK = Object.keys(parse_json_mapping[x])[4]; // ten logic cua T_REL
      var NameTableWK = parse_json_mapping[x][keyOfNameTableWK];

      var nullValue;

      // check sai tên cột
      if (json_table_T_REL[nmPhysicColumnTableT_REL] == undefined || json_table_T_REL[nmPhysicColumnTableT_REL] == null) {
        alert(`Kiểm tra lại tên cột ${nmPhysicColumnTableT_REL} trong file mapping.`);
        return false;
      }

      if (!json_table_T_REL[nmPhysicColumnTableT_REL].NULLABLE) {

        if (json_table_T_REL[nmPhysicColumnTableT_REL].TYPE == "VARCHAR2") {
          defaultValue = `'${json_table_T_REL[nmPhysicColumnTableT_REL].DEFAULT}'`
        } else {
          defaultValue = `${json_table_T_REL[nmPhysicColumnTableT_REL].DEFAULT}`
        }

        if (len > 5) {
          var keyOfNameTableWK = Object.keys(parse_json_mapping[x])[5]; // lay ra gia tri cua colunm Note
          var NameTableWK = parse_json_mapping[x][keyOfNameTableWK];
        } else {
          var keyOfNameTableWK = Object.keys(parse_json_mapping[x])[4]; // ten logic cua T_RdEL
          var NameTableWK = parse_json_mapping[x][keyOfNameTableWK];
        }
        nullValue = `,NVL(${NameTableWK}, ${defaultValue})`;
      } else {
        nullValue = `,${NameTableWK}`;
      }

      let spaceBeforeAs = "                                               ".slice(nullValue.length);
      outputSelect += "      " + nullValue + spaceBeforeAs + "AS       " + nmPhysicColumnTableT_REL + "\r";
    }
  }
  return output = outputInsert + outputSelect + outputWhere;
}