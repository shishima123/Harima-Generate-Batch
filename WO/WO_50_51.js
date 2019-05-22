function Start_To_Declare_WO_50_51(namePKG, nameJapanOfPkg, namePhysicTableT_REL, namePhysicTableWK) {
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
/********************************************************************************************
 * 名称    ： ${nameJapanOfPkg}（パッケージ定義）                                                       *
 * 作成日  ： ${dateNow}                                                                     *
 * 作成者  ： Rikkei                                                                         *
 * 更新日  ：                                                                                *
 * 更新者  ：                                                                                *
********************************************************************************************/

  PROCEDURE PR_GET_${namePKG} (
     IN_CO_CD               IN VARCHAR2                            -- 会社コード
    ,IN_EIGYO_CD            IN VARCHAR2                            -- 営業所コード
    ,IN_JYUSHIN_USER_CD     IN VARCHAR2                            -- 営業所コード
    ,IN_JSON_DATA           IN CLOB                                -- ファイル内容の配列
    ,IN_SHUHAISHIN_SEQ      IN VARCHAR2                            -- 営業所コード

    ,OUT_DATA_KENSU         OUT NUMBER                             -- データ件数
    ,OUT_DENPYO_MAISU       OUT NUMBER                             -- 伝票枚数
    ,OUT_MEISAI_KENSU       OUT NUMBER                             -- 明細件数
    ,OUT_ERR_CD             OUT VARCHAR2                           -- ｴﾗｰｺｰﾄﾞ
    ,OUT_ERR_MSG            OUT VARCHAR2                           -- ｴﾗｰﾒｯｾｰｼﾞ
  );

END PKG_${namePKG};
/

CREATE OR REPLACE PACKAGE BODY PKG_${namePKG} AS
/********************************************************************************************
 * 名称    ： ${nameJapanOfPkg}（パッケージ本体）                                                   *
 * 作成日  ： 2019/04/25                                                                     *
 * 作成者  ： Rikkei                                                                         *
 * 更新日  ：                                                                                *
 * 更新者  ：                                                                                *
********************************************************************************************/

  /******************************************************************************************
   * ${nameJapanOfPkg}                                                                            *
  ******************************************************************************************/
  PROCEDURE PR_GET_${namePKG} (
     IN_CO_CD               IN VARCHAR2                            -- 会社コード
    ,IN_EIGYO_CD            IN VARCHAR2                            -- 営業所コード
    ,IN_JYUSHIN_USER_CD     IN VARCHAR2                            -- 営業所コード
    ,IN_JSON_DATA           IN CLOB                                -- ファイル内容の配列
    ,IN_SHUHAISHIN_SEQ      IN VARCHAR2                            -- 営業所コード

    ,OUT_DATA_KENSU         OUT NUMBER                             -- データ件数
    ,OUT_DENPYO_MAISU       OUT NUMBER                             -- 伝票枚数
    ,OUT_MEISAI_KENSU       OUT NUMBER                             -- 明細件数
    ,OUT_ERR_CD             OUT VARCHAR2                           -- ｴﾗｰｺｰﾄﾞ
    ,OUT_ERR_MSG            OUT VARCHAR2                           -- ｴﾗｰﾒｯｾｰｼﾞ
  ) IS

    /* 定数 ---------------------------------------------------------------------*/
    C_PGID                  CONSTANT VARCHAR2(30) := '${namePKG}';

    /* 変数 ---------------------------------------------------------------------*/
    WK_TAG_PRE              CHAR(2)        := '';
    WK_TAG                  CHAR(2)        := '';
    WK_DATA_ROW             VARCHAR2(4000) := '';
    REC                     ${namePhysicTableWK}%ROWTYPE;

    WK_SHUHAISHIN1_CD       ${namePhysicTableT_REL}.SHUHAISHIN1_CD%TYPE;                             -- 集配信一次店CD
    WK_SHUHAISHIN2_CD       ${namePhysicTableT_REL}.SHUHAISHIN2_CD%TYPE;                             -- 集配信二次店CD
    WK_SHUHAISHIN3_CD       ${namePhysicTableT_REL}.SHUHAISHIN3_CD%TYPE;                             -- 集配信三次店CD
    WK_JYUSHIN_YMD          ${namePhysicTableT_REL}.JYUSHIN_YMD%TYPE;                                -- 受信日
    WK_JYUSHIN_TIME         ${namePhysicTableT_REL}.JYUSHIN_TIME%TYPE;                               -- 受信時刻

    STR_ERRCD_E10           VARCHAR2(100)       := E.OF_CONST('E10');                 -- ﾚｺｰﾄﾞ区分不正時の、ｴﾗｰｺｰﾄﾞ
    STR_ERRMSG_E10          VARCHAR2(100)       := E.OF_CONST('E10_MSG_${msgERRCD}');         -- ﾚｺｰﾄﾞ区分不正時の、ｴﾗｰﾒｯｾｰｼﾞ
    STR_ERRCD_E11           VARCHAR2(100)       := E.OF_CONST('E11');                 -- レコード区分順序時の、ｴﾗｰｺｰﾄﾞ
    STR_ERRMSG_E11          VARCHAR2(100)       := E.OF_CONST('E11_MSG_${msgERRCD}');         -- レコード区分順序時の、ｴﾗｰﾒｯｾｰｼﾞ

  /* =================================================================
  処理開始
  ================================================================== */
  BEGIN
    -- << 初期値設定 >> ----------------------------------------------
    OUT_DATA_KENSU     := 0;
    OUT_DENPYO_MAISU   := 0;
    OUT_MEISAI_KENSU   := 0;
    OUT_ERR_CD         := '';
    OUT_ERR_MSG        := '';

    -- ﾌｧｲﾙﾊﾟｽの取得
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

    -- データ配列のループ
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

        -- タグを取得して変数にセットする
        WK_TAG := TRIM(SUBSTRB(WK_DATA_ROW, 1, 2));

        -- レコード件数をカウントする。
        OUT_DATA_KENSU := OUT_DATA_KENSU + 1;

        IF WK_TAG != '50' AND WK_TAG != '51' THEN
          OUT_ERR_CD   := STR_ERRCD_E10;
          OUT_ERR_MSG  := STR_ERRMSG_E10;
          RETURN;
        ELSIF OUT_DATA_KENSU = 1 AND WK_TAG != '50' THEN
          OUT_ERR_CD   := STR_ERRCD_E11;
          OUT_ERR_MSG  := STR_ERRMSG_E11;
          RETURN;
        ELSIF OUT_DATA_KENSU > 1 AND ((WK_TAG_PRE = '50' AND (WK_TAG != '50' AND WK_TAG != '51'))) THEN
          OUT_ERR_CD   := STR_ERRCD_E11;
          OUT_ERR_MSG  := STR_ERRMSG_E11;
          RETURN;
        END IF;

        -- 本レコードのタグを変数に格納する。
        WK_TAG_PRE := WK_TAG;
      END LOOP;
`;
  return startToCompare;
}

function Declare_To_SubStrb_WO_50_51(json_table_WK) {
  let beforeDeclare = `
    -- タグが”51”のレコードのタイプを宣言する
    DECLARE TYPE  D_REC IS RECORD (
      BDE_SEQ_NO          NUMBER := 0 ,        -- ワークSEQ_NO
`;

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
      let phyNm = json_table_WK[i].PHY_NM;
      let spaceAfterPhysicNm = "                    ".slice(phyNm.length);
      let digit = json_table_WK[i].DIGIT;
      let spaceAfterVarchar2 = "          ".slice(digit.toString().length);

      beforeDeclare += "      " + phyNm + spaceAfterPhysicNm + "VARCHAR2(" + json_table_WK[i].DIGIT + ")," + spaceAfterVarchar2 + "-- " + json_table_WK[i].LOG_NM + "\r";
    } else if (firstChar == "Y") {
      break;
    }
  }

  // thay dau "," cuoi cung thanh ";"
  lastComma = beforeDeclare.lastIndexOf(',');
  declare = beforeDeclare.substr(0, lastComma) + ');' + beforeDeclare.substr(lastComma + 2);
  let output = beforeDeclare + afterDeclare;

  return output;
}

function SubStrb_To_Insert_T_REL_WO_50_51(json_table_WK, namePhysicTableWK) {
  let SubStrb50 = `
        IF WK_TAG = '50' THEN
`;

  let beforeSubStrb51 = `
        ELSIF WK_TAG = '51' THEN
          TYPE_D.BDE_SEQ_NO            :=   TYPE_D.BDE_SEQ_NO + 1;                     -- SEQをBDE_SEQ_NOにセットする
`;

  let midSubStrb51 = `

          TABLE_D.EXTEND;
          TABLE_D(1) := TYPE_D;

          TYPE_D.BDE_SEQ_NO            :=   TYPE_D.BDE_SEQ_NO + 1;                     -- SEQをBDE_SEQ_NOにセットする
`;

  let insert1 = `

          TABLE_D.EXTEND;
          TABLE_D(2)    := TYPE_D;

          FOR i IN TABLE_D.FIRST .. TABLE_D.LAST
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
                ,WK_SHUHAISHIN1_CD
                ,WK_SHUHAISHIN2_CD
                ,WK_SHUHAISHIN3_CD
                ,IN_SHUHAISHIN_SEQ
                ,TABLE_D(i).BDE_SEQ_NO
                ,WK_JYUSHIN_YMD
                ,WK_JYUSHIN_TIME
                ,IN_JYUSHIN_USER_CD
`

  let insert3 = `
                ,1
                ,E.FN_削除フラグ('有効')
                ,SYSTIMESTAMP(3)
                ,IN_JYUSHIN_USER_CD
                ,C_PGID
                ,SYSTIMESTAMP(3)
                ,IN_JYUSHIN_USER_CD
                ,C_PGID
                );
          END LOOP;

          -- インデックスを設定するためにテーブルを削除する
          TABLE_D.DELETE;
        END IF;
      END LOOP;
    END; -- BEGIN完了
`;


  var posOfH = 1;
  var posOfM = 1;
  for (var i in json_table_WK) {
    var firstChar = json_table_WK[i].PHY_NM.slice(0, 1);

    if (firstChar == "H") {
      let phyNm = json_table_WK[i].PHY_NM;
      let spaceAfterPhysicNm = "                         ".slice(phyNm.length);
      let digit = json_table_WK[i].DIGIT;
      let subStrb = `:=   SUBSTRB(WK_DATA_ROW, ${posOfH}, ${digit});`
      let logicNm = json_table_WK[i].LOG_NM;
      let lenSubStrb = posOfH.toString().length + digit.toString().length;
      let spaceAfterSubStrb = "                  -- ".slice(lenSubStrb);
      let spaceAfterPhysicNm2 = "                           -- ".slice(phyNm.length);

      // substring
      SubStrb50 += "          REC." + phyNm + spaceAfterPhysicNm + subStrb + spaceAfterSubStrb + logicNm + "\r";
      // column insert
      insert1 += "                ," + phyNm + spaceAfterPhysicNm2 + logicNm + "\r";
      // value insert
      insert2 += "                ,REC." + phyNm + "\r";
      posOfH = posOfH + Number(digit);
    } else if (firstChar == "M") {
      let phyNm = json_table_WK[i].PHY_NM;
      let spaceAfterPhysicNm = "                      ".slice(phyNm.length);
      let digit = json_table_WK[i].DIGIT;
      let subStrb = `:=   SUBSTRB(WK_DATA_ROW, ${posOfM}, ${digit});`;
      let logicNm = json_table_WK[i].LOG_NM;
      let lenSubStrb = posOfM.toString().length + digit.toString().length;
      let spaceAfterSubStrb = "                  -- ".slice(lenSubStrb);
      let spaceAfterPhysicNm2 = "                           -- ".slice(phyNm.length);

      // substring
      beforeSubStrb51 += "          TYPE_D." + phyNm + spaceAfterPhysicNm + subStrb + spaceAfterSubStrb + logicNm + "\r";
      // column insert
      insert1 += "                ," + phyNm + spaceAfterPhysicNm2 + logicNm + "\r";
      // value insert
      insert2 += "                ,TABLE_D(i)." + phyNm + "\r";
      posOfM = posOfM + Number(digit);
    } else if (firstChar == "Y") {
      break;
    }
  }

  var y = 1;
  for (var i in json_table_WK) {
    var firstChar = json_table_WK[i].PHY_NM.slice(0, 1);
    if (firstChar == "M") {
      if (y != 1) {
        let phyNm = json_table_WK[i].PHY_NM;
        let spaceAfterPhysicNm = "                      ".slice(phyNm.length);
        let digit = json_table_WK[i].DIGIT;
        let subStrb = `:=   SUBSTRB(WK_DATA_ROW, ${posOfM}, ${digit});`;
        let logicNm = json_table_WK[i].LOG_NM;
        let lenSubStrb = posOfM.toString().length + digit.toString().length;
        let spaceAfterSubStrb = "                  -- ".slice(lenSubStrb);
        let spaceAfterPhysicNm2 = "                         -- ".slice(phyNm.length);

        // substring
        midSubStrb51 += "          TYPE_D." + phyNm + spaceAfterPhysicNm + subStrb + spaceAfterSubStrb + logicNm + "\r";

        posOfM = posOfM + Number(digit);
      } else if (firstChar == "Y") {
        break;
      }
      y++;
    }
  }

  let output = SubStrb50 + beforeSubStrb51 + midSubStrb51 + insert1 + insert2 + insert3;
  return output;
}

function Insert_T_REL_To_End_WO_50_51(parse_json_mapping, json_table_T_REL, namePhysicTableT_REL, namePhysicTableWK, namePKG) {
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
      ,UPD_PG)                    -- 更新PG
    SELECT
       CO_CD                                       AS CO_CD
      ,EIGYO_CD                                    AS EIGYO_CD
      ,NVL(SHUHAISHIN1_CD,' ')                     AS SHUHAISHIN1_CD
      ,NVL(SHUHAISHIN2_CD,' ')                     AS SHUHAISHIN2_CD
      ,NVL(SHUHAISHIN3_CD,' ')                     AS SHUHAISHIN3_CD
      ,SHUHAISHIN_SEQ                              AS SHUHAISHIN_SEQ
      ,WORKSHUHAISHIN_SEQ_NO                       AS SHUHAISHIN_SEQ_NO
      ,NVL(JYUSHIN_YMD,' ')                        AS JYUSHIN_YMD
      ,NVL(JYUSHIN_TIME,' ')                       AS JYUSHIN_TIME
      ,NVL(JYUSHIN_USER_CD,' ')                    AS JYUSHIN_USER_CD

`;

  var outputWhere = `

      ,1                                           AS UPD_CNT
      ,E.FN_削除フラグ('有効')                      AS DEL_FLG
      ,SYSTIMESTAMP(3)                             AS INS_DATETIME
      ,IN_JYUSHIN_USER_CD                          AS INS_USER_CD
      ,C_PGID                                      AS INS_PG
      ,SYSTIMESTAMP(3)                             AS UPD_DATETIME
      ,IN_JYUSHIN_USER_CD                          AS UPD_USER_CD
      ,C_PGID                                      AS UPD_PG
    FROM ${namePhysicTableWK}
    WHERE CO_CD           = IN_CO_CD
      AND EIGYO_CD        = IN_EIGYO_CD
      AND SHUHAISHIN_SEQ  = IN_SHUHAISHIN_SEQ
    ORDER BY WORKSHUHAISHIN_SEQ_NO;

    -- 伝票枚数と明細件数の設定値
    SELECT COUNT(DISTINCT M_DENPYO_NO), COUNT(1)
    INTO OUT_DENPYO_MAISU, OUT_MEISAI_KENSU
    FROM ${namePhysicTableWK}
    WHERE CO_CD          = IN_CO_CD
      AND EIGYO_CD       = IN_EIGYO_CD
      AND SHUHAISHIN_SEQ = IN_SHUHAISHIN_SEQ;

  RETURN;
  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('CODE:'||SQLCODE);
      DBMS_OUTPUT.PUT_LINE('EMSG:'||SQLERRM);
      -- 例外ｴﾗｰが発生した場合は、ｴﾗｰﾌﾗｸﾞに'E99'、ｴﾗｰﾒｯｾｰｼﾞに'CODE:'||SQLCODE || 'EMSG:'||SQLERRMをセットする
      -- ｴﾗｰﾌﾗｸﾞのｾｯﾄ
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
      outputSelect += "      " + nullValue + spaceBeforeAs + "AS " + NameTableT_REL + "\r";
    }
  }
  return output = outputInsert + outputSelect + outputWhere;
}