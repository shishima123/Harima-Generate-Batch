function Start_To_Declare(namePKG, nameJapanOfPkg ,namePhysicTableT_REL ,namePhysicTableWK) {
  var dateObj = new Date();
  var month = dateObj.getUTCMonth() + 1; //months from 1-12
  var day = dateObj.getUTCDate();
  month < 10 ? month = "0" + month.toString() : month;
  day < 10 ? day = "0" + day.toString() : day;
  var year = dateObj.getUTCFullYear();

  var dateNow = year + "/" + month + "/" + day;
  var startToDeclare = 
`CREATE OR REPLACE PACKAGE PKG_${namePKG} AS
/***************************************************************************************************
 * 名称  ： ${nameJapanOfPkg}（パッケージ定義）                                                       *
 * 作成日： ${dateNow}                                                                               *
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
 * 名称  ： ${nameJapanOfPkg}（パッケージ本体）                                                       *
 * 作成日： ${dateNow}                                                                               *
 * 作成者： Rikkei                                                                                   *
 * 更新日：                                                                                          *
 * 更新者：                                                                                          *
 ***************************************************************************************************/

  /*****************************************************************************************************
   * ${nameJapanOfPkg}                                                                                 *
   *****************************************************************************************************/
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
    WK_TAG_PRE              CHAR(2)        := '';
    WK_TAG                  CHAR(2)        := '';
    STR_ROW_DT_CNT          NUMBER         := 0;
    WK_DATA_ROW             VARCHAR2(4000) := '';
    REC                     ${namePhysicTableWK}%ROWTYPE;
    WK_SHUHAISHIN1_CD       ${namePhysicTableT_REL}.SHUHAISHIN1_CD%TYPE; -- 集配信一次店CD
    WK_SHUHAISHIN2_CD       ${namePhysicTableT_REL}.SHUHAISHIN2_CD%TYPE; -- 集配信二次店CD
    WK_SHUHAISHIN3_CD       ${namePhysicTableT_REL}.SHUHAISHIN3_CD%TYPE; -- 集配信三次店CD
    WK_JYUSHIN_YMD          ${namePhysicTableT_REL}.JYUSHIN_YMD%TYPE;    -- 受信日
    WK_JYUSHIN_TIME         ${namePhysicTableT_REL}.JYUSHIN_TIME%TYPE;   -- 受信時刻

    STR_ERRCD_E10           VARCHAR2(100)       := E.OF_CONST('E10');              -- ﾚｺｰﾄﾞ区分不正時の、ｴﾗｰｺｰﾄﾞ
    STR_ERRMSG_E10          VARCHAR2(100)       := E.OF_CONST('E10_MSG_RET');      -- ﾚｺｰﾄﾞ区分不正時の、ｴﾗｰﾒｯｾｰｼﾞ
    STR_ERRCD_E11           VARCHAR2(100)       := E.OF_CONST('E11');              -- レコード区分順序時の、ｴﾗｰｺｰﾄﾞ
    STR_ERRMSG_E11          VARCHAR2(100)       := E.OF_CONST('E11_MSG_RET');      -- レコード区分順序時の、ｴﾗｰﾒｯｾｰｼﾞ
  /* ==================================================================
    処理開始
  ================================================================== */
  BEGIN
    -- << 初期値設定 >> ----------------------------------------------
    OUT_DATA_KENSU         := 0;
    OUT_DENPYO_KENSU       := 0;
    OUT_MEISAI_KENSU       := 0;
    OUT_ERR_CD             := '';
    OUT_ERR_MSG            := '';

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

      -- レコードはスタートレコードと空白のレコードの場合、ループを続ける
      CONTINUE WHEN TRIM(WK_DATA_ROW) IS NULL;

      -- タグを取得して変数にセットする
      WK_TAG := TRIM(SUBSTRB(WK_DATA_ROW, 1, 2));

      -- レコード件数をカウントする。
      OUT_DATA_KENSU := OUT_DATA_KENSU + 1;

      IF WK_TAG != 'HD' AND WK_TAG != 'DT' AND WK_TAG != 'TR' THEN
        OUT_ERR_CD   := STR_ERRCD_E10;
        OUT_ERR_MSG  := STR_ERRMSG_E10;
        RETURN;
      ELSIF OUT_DATA_KENSU = 1 AND WK_TAG != 'HD' THEN
        OUT_ERR_CD   := STR_ERRCD_E11;
        OUT_ERR_MSG  := STR_ERRMSG_E11;
        RETURN;
      ELSIF OUT_DATA_KENSU > 1 AND (( WK_TAG_PRE = 'HD' AND WK_TAG != 'DT')
                             OR ( WK_TAG_PRE = 'DT' AND ( WK_TAG != 'DT' AND WK_TAG != 'TR'))
                             OR ( WK_TAG_PRE = 'TR' AND WK_TAG != 'HD' )) THEN
        OUT_ERR_CD   := STR_ERRCD_E11;
        OUT_ERR_MSG  := STR_ERRMSG_E11;
        RETURN;
      END IF;

      IF WK_TAG = 'HD' THEN
        OUT_DENPYO_KENSU := OUT_DENPYO_KENSU + 1;
      ELSIF WK_TAG = 'DT' THEN
        OUT_MEISAI_KENSU := OUT_MEISAI_KENSU + 1;
      END IF;

      -- 本レコードのタグを変数に格納する。
      WK_TAG_PRE := WK_TAG;
    END LOOP;

    REC.WORKSHUHAISHIN_SEQ_NO := 0;`
  return startToDeclare;
}

function Declare_To_SubStrb(json_table_WK) {
  let declare = `

    -- タグが”DT”のレコードのタイプを宣言する
    DECLARE TYPE  D_REC IS RECORD (
      BDE_SEQ_NO NUMBER := 0,                          -- WORKSHUHAISHIN_SEQ_NO
`
  let afterDeclare = `

    -- D_RECタイプのテーブルタイプを宣言する
    TYPE TR_D IS TABLE OF D_REC;

    -- TR_DタイプのTABLE_D変数を宣言する
    TABLE_D TR_D := TR_D();

    -- D_RECタイプのTYPE_D変数を宣言する
    TYPE_D D_REC;

    -------------------BEGIN
    BEGIN

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

        -- レコードはスタートレコードと空白のレコードの場合、ループを続ける
        CONTINUE WHEN TRIM(WK_DATA_ROW) IS NULL;

        -- タグを取得して変数にセットする
        WK_TAG := TRIM(SUBSTRB(WK_DATA_ROW, 1, 2));
`;

  for (var i in json_table_WK) {
    var firstChar = json_table_WK[i].PHY_NM.slice(0, 1);
    if (firstChar == "M") {
      let phyNm = json_table_WK[i].PHY_NM.slice(2);
      let spaceAfterPhysicNm = "                            ".slice(phyNm.length);
      let digit = json_table_WK[i].DIGIT;
      let spaceAfterVarchar2 = "          ".slice(digit.toString().length);

      declare += "      " + phyNm + spaceAfterPhysicNm + "VARCHAR2(" + json_table_WK[i].DIGIT + ")," + spaceAfterVarchar2 + "-- " + json_table_WK[i].LOG_NM + "\r";
    }
  }

  // thay dau "," cuoi cung thanh ";"
  lastComma = declare.lastIndexOf(',');
  declare = declare.substr(0, lastComma) + ');' + declare.substr(lastComma + 2);
  let output = declare + afterDeclare;
  return output;
}

function SubStrb_To_Insert_WK(json_table_WK) {
  let wkTagHD = `
        IF WK_TAG = 'HD' THEN
          REC.H_TAG                    :=           WK_TAG;                          -- ヘッダー_タグ
`;

  let wkTagDT = `

        ELSIF WK_TAG = 'DT' THEN
          REC.WORKSHUHAISHIN_SEQ_NO    :=           REC.WORKSHUHAISHIN_SEQ_NO + 1;   -- SEQを1に増やす
          TYPE_D.BDE_SEQ_NO            :=           REC.WORKSHUHAISHIN_SEQ_NO;       -- SEQをBDE_SEQ_NOにセットする
          STR_ROW_DT_CNT               :=           STR_ROW_DT_CNT + 1;
          TYPE_D.TAG                   :=           WK_TAG;                          -- 明細_タグ
`;

let wkTagTR = `

          TABLE_D.extend;
          TABLE_D(STR_ROW_DT_CNT) := TYPE_D;

        ELSIF WK_TAG = 'TR' THEN
          REC.T_TAG                    :=           WK_TAG;                          -- トレーラ_タグ
`

  var startOfHD = 3;
  var startOfDT = 3;
  var startOfTR = 3;
  for (var i in json_table_WK) {
    var firstChar = json_table_WK[i].PHY_NM.slice(0, 1);

    if (firstChar == "H") {
      let phyNm = json_table_WK[i].PHY_NM;
      if (phyNm !== "H_TAG") {
        let spaceAfterPhysicNm = "                         ".slice(phyNm.length);

        let digit = json_table_WK[i].DIGIT;
        let subStrb = `:=           SUBSTRB(WK_DATA_ROW, ${startOfHD}, ${digit});`
        let logicNm = json_table_WK[i].LOG_NM;
        let lenSubStrb = startOfHD.toString().length + digit.toString().length;
        let spaceAfterSubStrb = "        -- ".slice(lenSubStrb);

        wkTagHD += "          REC." + phyNm + spaceAfterPhysicNm + subStrb + spaceAfterSubStrb + logicNm + "\r";
        startOfHD = startOfHD + digit;
      }
    }

    if (firstChar == "M") {
      let phyNm = json_table_WK[i].PHY_NM.slice(2);
      if (phyNm !== "TAG") {
        let spaceAfterPhysicNm = "                      ".slice(phyNm.length);

        let digit = json_table_WK[i].DIGIT;
        let subStrb = `:=           SUBSTRB(WK_DATA_ROW, ${startOfDT}, ${digit});`
        let logicNm = json_table_WK[i].LOG_NM;
        let lenSubStrb = startOfDT.toString().length + digit.toString().length;
        let spaceAfterSubStrb = "        -- ".slice(lenSubStrb);

        wkTagDT += "          TYPE_D." + phyNm + spaceAfterPhysicNm + subStrb + spaceAfterSubStrb + logicNm + "\r";
        startOfDT = startOfDT + digit;
      }
    }

    if (firstChar == "T") {
      let phyNm = json_table_WK[i].PHY_NM;
      if (phyNm !== "T_TAG") {
        let spaceAfterPhysicNm = "                         ".slice(phyNm.length);

        let digit = json_table_WK[i].DIGIT;
        let subStrb = `:=           SUBSTRB(WK_DATA_ROW, ${startOfTR}, ${digit});`
        let logicNm = json_table_WK[i].LOG_NM;
        let lenSubStrb = startOfTR.toString().length + digit.toString().length;
        let spaceAfterSubStrb = "        -- ".slice(lenSubStrb);

        wkTagTR += "          REC." + phyNm + spaceAfterPhysicNm + subStrb + spaceAfterSubStrb + logicNm + "\r";
        startOfTR = startOfTR + digit;
      }
    }
  }
  output = wkTagHD + wkTagDT + wkTagTR;
  return output
}

function Insert_WK_To_Insert_T_REL(json_table_WK, namePhysicTableWK) {
  let startInsertWK = `

          FOR i IN TABLE_D.FIRST .. TABLE_D.LAST
            LOOP
              INSERT INTO ${namePhysicTableWK}
`;

  let midInsertWK = `
                ,UPD_CNT                               -- 更新回数
                ,DEL_FLG                               -- 削除フラグ
                ,INS_DATETIME                          -- 登録日時
                ,INS_USER_CD                           -- 登録者(CD)
                ,INS_PG                                -- 登録PG
                ,UPD_DATETIME                          -- 更新日時
                ,UPD_USER_CD                           -- 更新者(CD)
                ,UPD_PG                                -- 更新PG
                )
                VALUES
                (IN_CO_CD
                ,IN_EIGYO_CD
                ,WK_SHUHAISHIN1_CD
                ,WK_SHUHAISHIN2_CD
                ,WK_SHUHAISHIN3_CD
                ,IN_SHUHAISHIN_SEQ
                ,TABLE_D(i).BDE_SEQ_NO
                ,WK_JYUSHIN_YMD
                ,WK_JYUSHIN_TIME
                ,IN_JYUSHIN_USER_CD
`;

  let endInsertWK = `
                ,1
                ,0
                ,SYSTIMESTAMP(3)
                ,IN_JYUSHIN_USER_CD
                ,C_PGID
                ,SYSTIMESTAMP(3)
                ,IN_JYUSHIN_USER_CD
                ,C_PGID
                );
            END LOOP;
            -- delete table to set index
            TABLE_D.delete;

          STR_ROW_DT_CNT               := 0;
        END IF;

      END LOOP;
    END; -- BEGIN完了
`

  for (var i in json_table_WK) {
    let namePhysic = json_table_WK[i].PHY_NM;
    let nameLogic = json_table_WK[i].LOG_NM;
    let firstChar = namePhysic.slice(0, 1);
    if (namePhysic == 'CO_CD') {
      spaceFirst = "                (";
    } else {
      spaceFirst = "                ,";
    }

    spaceAfterColumnNm = "                                      -- ".slice(namePhysic.length)
    // thoat vong lap neu gap phai YOBI
    if (firstChar == "Y") {
      break;
    } else {
      startInsertWK += spaceFirst + namePhysic + spaceAfterColumnNm +  nameLogic + "\r";
    }

    if (firstChar == "H" || firstChar == "T") {
      midInsertWK += spaceFirst + "REC." + namePhysic + "\r";
    } else if (firstChar == "M") {
      midInsertWK += spaceFirst + "TABLE_D(i)." + namePhysic.slice(2) + "\r";
    }
  }
  var output = startInsertWK + "\n" + midInsertWK + "\n" + endInsertWK;
  return output;
}

//TODO:code phần gen phần NVL
function Insert_T_REL_To_End(parse_json_mapping, json_table_T_REL, namePhysicTableT_REL, namePhysicTableWK,namePKG) {
  var outputInsert = `
    -- ${namePhysicTableWK}から${namePhysicTableT_REL}乳挿入する
    INSERT INTO ${namePhysicTableT_REL}
      (CO_CD               -- 会社コード
      ,EIGYO_CD            -- 営業所コード
      ,SHUHAISHIN1_CD      -- 集配信コード（一次店）
      ,SHUHAISHIN2_CD      -- 集配信コード（二次店）
      ,SHUHAISHIN3_CD      -- 集配信コード（三次店）
      ,SHUHAISHIN_SEQ      -- 集配信連番
      ,SHUHAISHIN_SEQ_NO   -- 集配信連番内SEQ
      ,JYUSHIN_YMD         -- 受信日
      ,JYUSHIN_TIME        -- 受信時刻
      ,JYUSHIN_USER_CD     -- 受信者CD
      ,DENPYO_ERR_FLG      -- 伝票単位ｴﾗｰ有無ﾌﾗｸﾞ
      ,GYO_ERR_FLG         -- 行単位ｴﾗｰ有無ﾌﾗｸﾞ

`;
  var outputSelect = `

      ,UPD_CNT             -- 更新回数
      ,DEL_FLG             -- 削除フラグ
      ,INS_DATETIME        -- 登録日時
      ,INS_USER_CD         -- 登録者(CD)
      ,INS_PG              -- 登録PG
      ,UPD_DATETIME        -- 更新日時
      ,UPD_USER_CD         -- 更新者(CD)
      ,UPD_PG)             -- 更新PG
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
    WHERE CO_CD = IN_CO_CD
      AND EIGYO_CD = IN_EIGYO_CD
      AND SHUHAISHIN_SEQ = IN_SHUHAISHIN_SEQ
    ORDER BY WORKSHUHAISHIN_SEQ_NO;

    RETURN;

  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('CODE:'||SQLCODE);
      DBMS_OUTPUT.PUT_LINE('EMSG:'||SQLERRM);
      -- 例外ｴﾗｰが発生した場合は、ｴﾗｰﾌﾗｸﾞに'E99'、ｴﾗｰﾒｯｾｰｼﾞに'CODE:'||SQLCODE || 'EMSG:'||SQLERRMをセットする
      -- ｴﾗｰﾌﾗｸﾞのｾｯﾄ
      OUT_ERR_CD := 'E99';
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
      var keyOfNameTableT_REL = Object.keys(parse_json_mapping[x])[1];
      var NameTableT_REL = parse_json_mapping[x][keyOfNameTableT_REL];  // ten vat ly cua t_rel
      var keyOfComment = Object.keys(parse_json_mapping[x])[0];
      var Comment = parse_json_mapping[x][keyOfComment];                // ten logic cua t_rel
      let spaceBeforeComment = "                    ".slice(NameTableT_REL.length);
      outputInsert += "      ," + NameTableT_REL + spaceBeforeComment + "-- " + Comment + "\r";

      // lay ra cot cua bang WK de insert vao bang T_REl
      var keyOfNameTableWK = Object.keys(parse_json_mapping[x])[4]; // ten logic cua T_REL
      var NameTableWK = parse_json_mapping[x][keyOfNameTableWK];
      
      var nullValue;

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