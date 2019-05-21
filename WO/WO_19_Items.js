function Start_To_Compare_WO_19_Items(namePKG, nameJapanOfPkg, namePhysicTableT_REL, namePhysicTableWK) {
  var dateObj = new Date();
  var month = dateObj.getUTCMonth() + 1; //months from 1-12
  var day = dateObj.getUTCDate();
  month < 10 ? month = "0" + month.toString() : month;
  day < 10 ? day = "0" + day.toString() : day;
  var year = dateObj.getUTCFullYear();

  var dateNow = year + "/" + month + "/" + day;

  msgERRCD = namePKG.slice(2, 5);

  var startToCompare =
`CREATE OR REPLACE PACKAGE PKG_${namePKG} AS
/***************************************************************************************************
 * 名称  ： ${nameJapanOfPkg}（パッケージ定義）                                                      *
 * 作成日： ${dateNow}                                                                                     *
 * 作成者： Rikkei                                                                                   *
 * 更新日：                                                                                          *
 * 更新者：                                                                                          *
 ***************************************************************************************************/

  PROCEDURE PR_GET_${namePKG} (
     IN_CO_CD               IN  ${namePhysicTableT_REL}.CO_CD%TYPE                -- 会社コード
    ,IN_EIGYO_CD            IN  ${namePhysicTableT_REL}.EIGYO_CD%TYPE             -- 営業所コード
    ,IN_JYUSHIN_USER_CD     IN  ${namePhysicTableT_REL}.JYUSHIN_USER_CD%TYPE      -- 受信者コード
    ,IN_JSON_DATA           IN  CLOB                               -- データ配列
    ,IN_SHUHAISHIN_SEQ      IN  ${namePhysicTableT_REL}.SHUHAISHIN_SEQ%TYPE       -- 集配信連番

    ,OUT_DATA_KENSU         OUT NUMBER                             -- データ件数
    ,OUT_DENPYO_KENSU       OUT NUMBER                             -- 伝票枚数
    ,OUT_MEISAI_KENSU       OUT NUMBER                             -- 明細件数
    ,OUT_ERR_CD             OUT VARCHAR2                           -- チェックエラーコード
    ,OUT_ERR_MSG            OUT VARCHAR2                           -- チェックエラーメッセージ
  );

END PKG_${namePKG};
/

CREATE OR REPLACE PACKAGE BODY PKG_${namePKG} AS
/***************************************************************************************************
 * 名称  ： ${nameJapanOfPkg}（パッケージ本体）                                                      *
 * 作成日： ${dateNow}                                                                                 *
 * 作成者： Rikkei                                                                                   *
 * 更新日：                                                                                          *
 * 更新者：                                                                                          *
 ***************************************************************************************************/

  /*********************************************************************************************************
   * ${nameJapanOfPkg}                                                                                  *
   *********************************************************************************************************/
  PROCEDURE PR_GET_${namePKG} (
     IN_CO_CD               IN  ${namePhysicTableT_REL}.CO_CD%TYPE                -- 会社コード
    ,IN_EIGYO_CD            IN  ${namePhysicTableT_REL}.EIGYO_CD%TYPE             -- 営業所コード
    ,IN_JYUSHIN_USER_CD     IN  ${namePhysicTableT_REL}.JYUSHIN_USER_CD%TYPE      -- 営業所コード
    ,IN_JSON_DATA           IN  CLOB
    ,IN_SHUHAISHIN_SEQ      IN  ${namePhysicTableT_REL}.SHUHAISHIN_SEQ%TYPE       -- 営業所コード

    ,OUT_DATA_KENSU         OUT NUMBER
    ,OUT_DENPYO_KENSU       OUT NUMBER
    ,OUT_MEISAI_KENSU       OUT NUMBER
    ,OUT_ERR_CD             OUT VARCHAR2
    ,OUT_ERR_MSG            OUT VARCHAR2
  ) IS

    /* 定数 ---------------------------------------------------------------------*/
    C_PGID                  CONSTANT VARCHAR2(30) := '${namePKG}';

    /* 変数 ---------------------------------------------------------------------*/
    WK_COL                   NUMBER          := 0;                                  -- 列の数
    WK_DATA_ROW              VARCHAR2(32000) := '';                                 -- 行データ
    WK_REC                   ${namePhysicTableWK}%ROWTYPE;                            -- 記録データ
    WK_COUNT                 NUMBER          := 0;
    WK_SHUHAISHIN1_CD        ${namePhysicTableT_REL}.SHUHAISHIN1_CD%TYPE;                          -- 集配信一次店CD
    WK_SHUHAISHIN2_CD        ${namePhysicTableT_REL}.SHUHAISHIN2_CD%TYPE;                          -- 集配信二次店CD
    WK_SHUHAISHIN3_CD        ${namePhysicTableT_REL}.SHUHAISHIN3_CD%TYPE;                          -- 集配信三次店CD
    WK_JYUSHIN_YMD           ${namePhysicTableT_REL}.JYUSHIN_YMD%TYPE;                             -- 受信日
    WK_JYUSHIN_TIME          ${namePhysicTableT_REL}.JYUSHIN_TIME%TYPE;                            -- 受信時刻
    WK_WORKSHUHAISHIN_SEQ_NO NUMBER          := 0;                                  -- 列の数
    WK_STR_ERRCD_E10         VARCHAR2(100)       := E.OF_CONST('E10');              -- ﾚｺｰﾄﾞ区分不正時の、ｴﾗｰｺｰﾄﾞ
    WK_STR_ERRMSG_E10        VARCHAR2(100)       := E.OF_CONST('E10_MSG_${msgERRCD}');      -- ﾚｺｰﾄﾞ区分不正時の、ｴﾗｰﾒｯｾｰｼﾞ
    WK_STR_ERRCD_E11         VARCHAR2(100)       := E.OF_CONST('E11');              -- ﾚｺｰﾄﾞ区分不正時の、ｴﾗｰｺｰﾄﾞ
    WK_STR_ERRMSG_E11        VARCHAR2(100)       := E.OF_CONST('E11_MSG_${msgERRCD}');      -- ﾚｺｰﾄﾞ区分不正時の、ｴﾗｰﾒｯｾｰｼﾞ

  /* ==================================================================
    処理開始
  ================================================================== */
  BEGIN
    -- << 初期値設定 >> ----------------------------------------------
    OUT_DATA_KENSU               := 0;
    OUT_DENPYO_KENSU             := 0;
    OUT_MEISAI_KENSU             := 0;
    WK_WORKSHUHAISHIN_SEQ_NO     := 0;
    OUT_ERR_CD                   := '';
    OUT_ERR_MSG                  := '';

    SELECT
       JSON_VALUE(IN_JSON_DATA, '$.SHUHAISHIN1_CD' RETURNING VARCHAR2)
      ,JSON_VALUE(IN_JSON_DATA, '$.SHUHAISHIN2_CD' RETURNING VARCHAR2)
      ,JSON_VALUE(IN_JSON_DATA, '$.SHUHAISHIN3_CD' RETURNING VARCHAR2)
      ,JSON_VALUE(IN_JSON_DATA, '$.JYUSHIN_YMD' RETURNING VARCHAR2)
      ,JSON_VALUE(IN_JSON_DATA, '$.JYUSHIN_TIME' RETURNING VARCHAR2)
    INTO
       WK_SHUHAISHIN1_CD   -- 集配信一次店CD
      ,WK_SHUHAISHIN2_CD   -- 集配信二次店CD
      ,WK_SHUHAISHIN3_CD   -- 集配信三次店CD
      ,WK_JYUSHIN_YMD      -- 受信日
      ,WK_JYUSHIN_TIME     -- 受信時刻
    FROM DUAL;

    --データ配列のループ
    FOR VRECD IN
      (
        SELECT JT.DATA_ROW AS DATA_ROW
        FROM
          JSON_TABLE(IN_JSON_DATA,'$.DATA[*]'
            COLUMNS(
              DATA_ROW  PATH '$'
            )) AS JT
      ) LOOP
        WK_DATA_ROW := VRECD.DATA_ROW;

        --レコードはスタートレコードと空白のレコードの場合、ループを続ける
        CONTINUE WHEN TRIM(WK_DATA_ROW) IS NULL;

`

  return startToCompare;
}

function Compare_To_SubStrb_WO_19_Items() {
  let output = `
        -- レコード件数をカウントする。
        OUT_DATA_KENSU := OUT_DATA_KENSU + 1;

        -- レコードの項目をカウントする
        SELECT REGEXP_COUNT(WK_DATA_ROW, ',') + 1 INTO WK_COL FROM DUAL;

        -- レコードが19項目ではない場合はエラーです。
        IF WK_COL <> 19 THEN
          OUT_ERR_CD   := WK_STR_ERRCD_E10;
          OUT_ERR_MSG  := WK_STR_ERRMSG_E10;
          RETURN;
        END IF;

        -- アイテム名レコードを確認してください
        IF OUT_DATA_KENSU = 1 THEN

          -- 項目名のレコードの下記の項目でなければエラー。
          IF  PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 1)  IS NULL
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 2)  IS NULL
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 3)  IS NULL
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 4)  IS NULL
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 5)  IS NULL
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 6)  IS NULL
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 7)  IS NULL
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 8)  IS NULL
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 9)  IS NULL
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 10) IS NULL
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 11) IS NULL
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 12) IS NULL
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 13) IS NULL
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 14) IS NULL
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 15) IS NULL
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 16) IS NULL
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 17) IS NULL
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 18) IS NULL
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 19) IS NULL
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 1)  <> '会社コード'
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 2)  <> '会社名'
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 3)  <> '店舗コード'
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 4)  <> '店舗名'
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 5)  <> '取引先コード'
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 6)  <> '取引先名'
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 7)  <> '発注日'
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 8)  <> '店着日'
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 9)  <> '伝票No.'
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 10) <> '旧伝票No.'
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 11) <> '分類コード'
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 12) <> '金額'
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 13) <> '締め日'
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 14) <> '処理日'
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 15) <> '指図No.'
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 16) <> '受信・発注'
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 17) <> '出荷'
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 18) <> '受領'
            OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 19) <> '追加返品'
          THEN
            OUT_ERR_CD   := WK_STR_ERRCD_E11;
            OUT_ERR_MSG  := WK_STR_ERRMSG_E11;
            RETURN;
          END IF;
        END IF;
    END LOOP;

    -- データ挿入プロセスを開始する
    BEGIN

    FOR VRECD IN
    (
      SELECT JTT.DATA_ROW AS DATA_ROW
      FROM
        JSON_TABLE(IN_JSON_DATA,'$.DATA[*]'
          COLUMNS(
            DATA_ROW  PATH '$'
          )) AS JTT
    ) LOOP
      WK_DATA_ROW := VRECD.DATA_ROW;

      -- レコードはスタートレコードと空白のレコードの場合、ループを続ける
      CONTINUE WHEN TRIM(WK_DATA_ROW) IS NULL;

      -- レコードのカウント
      WK_COUNT                        := WK_COUNT + 1;
`;
  return output;
}

function SubStrb_To_Insert_WK_WO_19_Items (json_table_WK) {
  let output = `
      -- 項目名のレコードを破棄 AND 会社コード（KAISHA_CD）が EC ではない行はINSERTしない。
      CONTINUE WHEN WK_COUNT = 1 OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 1) <> 'EC'
                                 OR PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, 1) IS NULL;

      WK_WORKSHUHAISHIN_SEQ_NO         := WK_WORKSHUHAISHIN_SEQ_NO + 1;
      WK_REC.WORKSHUHAISHIN_SEQ_NO     := WK_WORKSHUHAISHIN_SEQ_NO;
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
      let subStrb = `:= PKG_HB.FN_GET_ITEM_STRING_ENTRY(WK_DATA_ROW, ${y});`
      let logicNm = json_table_WK[i].LOG_NM;
      let spaceAfterSubStrb = "         -- ".slice(y.toString().length);

      output += "      WK_REC." + phyNm + spaceAfterPhysicNm + subStrb + spaceAfterSubStrb + logicNm + "\r";
    }
  }
  return output;
}

function Insert_WK_To_Insert_T_REL_WO_19_Items(json_table_WK ,namePhysicTableWK) {
  let beforeInsert = `
      -- テーブル${namePhysicTableWK}に挿入
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

  let midInsert =`

        ,UPD_CNT                  -- 更新回数
        ,DEL_FLG                  -- 削除フラグ
        ,INS_DATETIME             -- 登録日時
        ,INS_USER_CD              -- 登録者(CD)
        ,INS_PG                   -- 登録PG
        ,UPD_DATETIME             -- 更新日時
        ,UPD_USER_CD              -- 更新者(CD)
        ,UPD_PG                   -- 更新PG
        )
      VALUES
        (IN_CO_CD
        ,IN_EIGYO_CD
        ,WK_SHUHAISHIN1_CD
        ,WK_SHUHAISHIN2_CD
        ,WK_SHUHAISHIN3_CD
        ,IN_SHUHAISHIN_SEQ
        ,WK_REC.WORKSHUHAISHIN_SEQ_NO
        ,WK_JYUSHIN_YMD
        ,WK_JYUSHIN_TIME
        ,IN_JYUSHIN_USER_CD

`;

  let afterInsert = `
        ,1
        ,E.FN_削除フラグ('有効')
        ,SYSTIMESTAMP(3)
        ,IN_JYUSHIN_USER_CD
        ,C_PGID
        ,SYSTIMESTAMP(3)
        ,IN_JYUSHIN_USER_CD
        ,C_PGID);
      END LOOP;
    END;
`;
  var x = 0;
  for (var i in json_table_WK) {
    var firstChar = json_table_WK[i].PHY_NM.slice(0, 4);
    x++;
    if (firstChar == "YOBI") {
      break;
    } else if (x > 10) {
      let phyNm = json_table_WK[i].PHY_NM;
      let spaceAfterPhysicNm = "                         ".slice(phyNm.length);
      let logicNm = json_table_WK[i].LOG_NM;

      beforeInsert += "        ," + phyNm + spaceAfterPhysicNm + "-- " + logicNm + "\r";
      midInsert += "        ,WK_REC." + phyNm + "\r";
    }
  }
  return output = beforeInsert + midInsert + afterInsert;
}

function Insert_T_REL_To_End_WO_19_Items(parse_json_mapping, json_table_T_REL, namePhysicTableT_REL, namePhysicTableWK, namePKG) {

  var outputInsert = `
    -- ${namePhysicTableT_REL}から${namePhysicTableWK}を挿入する
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
      ,DENPYO_ERR_FLG             -- 伝票単位ｴﾗｰ有無ﾌﾗｸﾞ
      ,GYO_ERR_FLG                -- 行単位ｴﾗｰ有無ﾌﾗｸﾞ

`;
  var outputSelect = `

      ,UPD_CNT                    -- 更新回数
      ,DEL_FLG                    -- 削除フラグ
      ,INS_DATETIME               -- 登録日時
      ,INS_USER_CD                -- 登録者(CD)
      ,INS_PG                     -- 登録PG
      ,UPD_DATETIME               -- 更新日時
      ,UPD_USER_CD                -- 更新者(CD)
      ,UPD_PG)                    -- 更新PG
    SELECT
       CO_CD                                       AS       CO_CD
      ,EIGYO_CD                                    AS       EIGYO_CD
      ,NVL(SHUHAISHIN1_CD,' ')                     AS       SHUHAISHIN1_CD
      ,NVL(SHUHAISHIN2_CD,' ')                     AS       SHUHAISHIN2_CD
      ,NVL(SHUHAISHIN3_CD,' ')                     AS       SHUHAISHIN3_CD
      ,SHUHAISHIN_SEQ                              AS       SHUHAISHIN_SEQ
      ,WORKSHUHAISHIN_SEQ_NO                       AS       SHUHAISHIN_SEQ_NO
      ,NVL(JYUSHIN_YMD,' ')                        AS       JYUSHIN_YMD
      ,NVL(JYUSHIN_TIME,' ')                       AS       JYUSHIN_TIME
      ,NVL(JYUSHIN_USER_CD,' ')                    AS       JYUSHIN_USER_CD
      ,0                                           AS       DENPYO_ERR_FLG
      ,0                                           AS       GYO_ERR_FLG

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

    -- 伝票枚数と明細件数の設定値
    SELECT COUNT(DISTINCT DENPYO_NO), COUNT(*)
      INTO OUT_DENPYO_KENSU, OUT_MEISAI_KENSU
    FROM ${namePhysicTableWK}
    WHERE CO_CD          = IN_CO_CD
      AND EIGYO_CD       = IN_EIGYO_CD
      AND SHUHAISHIN_SEQ = IN_SHUHAISHIN_SEQ;

    RETURN;

  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('CODE:'||SQLCODE);
      DBMS_OUTPUT.PUT_LINE('EMSG:'||SQLERRM);
      --例外ｴﾗｰが発生した場合は、ｴﾗｰﾌﾗｸﾞに'E99'、ｴﾗｰﾒｯｾｰｼﾞに'CODE:'||SQLCODE || 'EMSG:'||SQLERRMをセットする
      --ｴﾗｰﾌﾗｸﾞのｾｯﾄ
      OUT_ERR_CD := 'E99';
      --ｴﾗｰﾒｯｾｰｼﾞのｾｯﾄ
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
      var keyOfNameTableT_REL = Object.keys(parse_json_mapping[x])[1];
      var NameTableT_REL = parse_json_mapping[x][keyOfNameTableT_REL];  // ten vat ly cua t_rel
      var keyOfComment = Object.keys(parse_json_mapping[x])[0];
      var Comment = parse_json_mapping[x][keyOfComment];                // ten logic cua t_rel
      let spaceBeforeComment = "                           ".slice(NameTableT_REL.length);
      outputInsert += "      ," + NameTableT_REL + spaceBeforeComment + "-- " + Comment + "\r";

      // lay ra cot cua bang WK de insert vao bang T_REl
      var keyOfNameTableWK = Object.keys(parse_json_mapping[x])[4]; // ten logic cua T_REL
      var NameTableWK = parse_json_mapping[x][keyOfNameTableWK];

      var nullValue;

      // check sai tên cột
      if (json_table_T_REL[NameTableT_REL] == undefined || json_table_T_REL[NameTableT_REL] == null) {
        alert(`Kiểm tra lại tên cột ${NameTableT_REL} trong file mapping.`);
        return false;
      }

      if (!json_table_T_REL[NameTableT_REL].NULLABLE) {

        if (json_table_T_REL[NameTableT_REL].TYPE == "VARCHAR2") {
          defaultValue = `'${json_table_T_REL[NameTableT_REL].DEFAULT}'`
        } else {
          defaultValue = `${json_table_T_REL[NameTableT_REL].DEFAULT}`
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

      let spaceBeforeAs = "                                             ".slice(nullValue.length);
      outputSelect += "      " + nullValue + spaceBeforeAs + "AS       " + NameTableT_REL + "\r";
    }
  }
  return output = outputInsert + outputSelect + outputWhere;
}
