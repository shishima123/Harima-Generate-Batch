function Start_To_Compare_BO_Common(namePKG, nameJapanOfPkg, namePhysicTableT_REL, namePhysicTableWK) {
  var dateObj = new Date();
  var month = dateObj.getUTCMonth() + 1; //months from 1-12
  var day = dateObj.getUTCDate();
  month < 10 ? month = "0" + month.toString() : month;
  day < 10 ? day = "0" + day.toString() : day;
  var year = dateObj.getUTCFullYear();

  var dateNow = year + "/" + month + "/" + day;

  msgERRCD = namePKG.slice(2, 5);

  // Chon loai Batch se duoc gen
  var type = $("#typeBatch option:selected").val();

  switch (type) {
    case "BO_L_B_D":
      var commentFeature = `
\r                /********1*********2*********3*********4*********5*********6*********7*********8*********9*********10********11********12********13********14********15********16********
                * ﾚｺｰﾄﾞ区分不正ﾁｪｯｸ    ：PG毎に異なる
                                    ：レコード（R）区分　L B D  以外はエラー。の場合、ﾚｺｰﾄﾞ区分不正の為、エラー処理を行う。
                ********1*********2*********3*********4*********5*********6*********7*********8*********9*********10********11********12********13********14********15********16********/`;
      break;
    case "BO_A_B_C_D_E":
      var commentFeature = `
\r          /********1*********2*********3*********4*********5*********6*********7*********8*********9*********10********11********12********13********14********15********16********
          * ﾚｺｰﾄﾞ区分不正ﾁｪｯｸ    ：PG毎に異なる
                                ：フォーマットID　A B C D E  以外はエラー。の場合、ﾚｺｰﾄﾞ区分不正の為、エラー処理を行う。
          ********1*********2*********3*********4*********5*********6*********7*********8*********9*********10********11********12********13********14********15********16********/`;
      break;
    default:
      var commentFeature = '';
  }

  var startToCompare =
    `CREATE OR REPLACE PACKAGE PKG_${namePKG} AS
/********************************************************************************************
 * 名称   ： ${nameJapanOfPkg}（パッケージ定義）                                        *
 * 作成日 ： ${dateNow}                                                                      *
 * 作成者 ： Rikkei                                                                          *
 * 更新日 ：                                                                       *
 * 更新者 ：                                                                           *
********************************************************************************************/

  PROCEDURE PR_GET_${namePKG} (
     IN_CO_CD                      IN VARCHAR2                    -- 会社コード
    ,IN_EIGYO_CD                   IN VARCHAR2                    -- 営業所コード
    ,IN_JYUSHIN_USER_CD            IN VARCHAR2                    -- 受信者コード
    ,IN_FILE_NM                    IN VARCHAR2                    -- ﾌｧｲﾙ名
    ,IN_SHUHAISHIN_SEQ             IN NUMBER                      -- 集配信連番

    ,OUT_DATA_KENSU                OUT NUMBER                     -- データ件数
    ,OUT_DENPYO_KENSU              OUT NUMBER                     -- 伝票件数
    ,OUT_MEISAI_KENSU              OUT NUMBER                     -- 明細件数
    ,OUT_ERR_CD                    OUT VARCHAR2                   -- ｴﾗｰｺｰﾄﾞ
    ,OUT_ERR_MSG                   OUT VARCHAR2                   -- ｴﾗｰﾒｯｾｰｼﾞ
  );

END PKG_${namePKG};
/
CREATE OR REPLACE PACKAGE BODY PKG_${namePKG} AS
/********************************************************************************************
 * 名称    ： ${nameJapanOfPkg}（パッケージ本体）                                      *
 * 作成日  ： ${dateNow}                                                                     *
 * 作成者  ： Rikkei                                                                         *
 * 更新日  ：                                                                      *
 * 更新者  ：                                                                          *
********************************************************************************************/

  /******************************************************************************************
   * ${nameJapanOfPkg}                                                                        *
  ******************************************************************************************/
  PROCEDURE PR_GET_${namePKG} (
     IN_CO_CD                      IN VARCHAR2                    -- 会社コード
    ,IN_EIGYO_CD                   IN VARCHAR2                    -- 営業所コード
    ,IN_JYUSHIN_USER_CD            IN VARCHAR2                    -- 受信者コード
    ,IN_FILE_NM                    IN VARCHAR2                    -- ﾌｧｲﾙ名
    ,IN_SHUHAISHIN_SEQ             IN NUMBER                      -- 集配信連番
    ,OUT_DATA_KENSU                OUT NUMBER                     -- データ件数
    ,OUT_DENPYO_KENSU              OUT NUMBER                     -- 伝票件数
    ,OUT_MEISAI_KENSU              OUT NUMBER                     -- 明細件数
    ,OUT_ERR_CD                    OUT VARCHAR2                   -- ｴﾗｰｺｰﾄﾞ
    ,OUT_ERR_MSG                   OUT VARCHAR2                   -- ｴﾗｰﾒｯｾｰｼﾞ
  ) IS

    /* 定数 ---------------------------------------------------------------------*/
    C_PGID                CONSTANT VARCHAR2(30) := '${namePKG}';
    C_USER_ID             CONSTANT VARCHAR2(30) := 'SYSTEM';

    -- 他プロシージャ呼び出し用
    WK_FILE_HANDLE        UTL_FILE.FILE_TYPE;                                      -- ファイルハンドル
    WK_V_PATH             VARCHAR2(256);                                           -- ファイルパス
    WK_V_WRITCHAR         VARCHAR2(600);                                           -- データ
    STR_END               CHAR(5)               := E.OF_CONST('END');              -- ｴﾝﾄﾞﾚｺｰﾄﾞ：ｴﾝﾄﾞﾚｺｰﾄﾞのﾚｺｰﾄﾞ区分を取得 → 'END'
    STR_START             CHAR(5)               := E.OF_CONST('START');            -- ｽﾀｰﾄﾚｺｰﾄﾞ：ｽﾀｰﾄﾚｺｰﾄﾞのﾚｺｰﾄﾞ区分を取得 → 'START'
    STR_ZEN_REC_KBN       CHAR(1)               := '';                             -- 前ﾚｺｰﾄﾞ区分
    STR_REC_KBN           CHAR(1)               := '';                             -- レコード区分
    STR_ERRCD_E10         ${namePhysicTableT_REL}.ERR_CD%TYPE  := E.OF_CONST('E10');              -- ﾚｺｰﾄﾞ区分不正時の、ｴﾗｰｺｰﾄﾞ
    STR_ERRMSG_E10        ${namePhysicTableT_REL}.ERR_MSG%TYPE := E.OF_CONST('E10_MSG_${msgERRCD}');      -- ﾚｺｰﾄﾞ区分不正時の、ｴﾗｰﾒｯｾｰｼﾞ
    STR_ERRCD_E11         ${namePhysicTableT_REL}.ERR_CD%TYPE  := E.OF_CONST('E11');              -- レコード区分順序時の、ｴﾗｰｺｰﾄﾞ
    STR_ERRMSG_E11        ${namePhysicTableT_REL}.ERR_MSG%TYPE := E.OF_CONST('E11_MSG_${msgERRCD}');      -- レコード区分順序時の、ｴﾗｰﾒｯｾｰｼﾞ
    REC                   ${namePhysicTableWK}%ROWTYPE;
    WK_FLG                BOOLEAN               := FALSE;                          -- フラグチェック終了1レコード
    STR_COUNT             NUMBER                := 0;                              -- カウント形式はD

    /* =================================================================
    処理開始
    ================================================================== */
  BEGIN
    -- << 初期値設定 >> ---------------------------------------------
    OUT_DATA_KENSU         := 0;
    OUT_DENPYO_KENSU       := 0;
    OUT_MEISAI_KENSU       := 0;
    OUT_ERR_CD             := '';
    OUT_ERR_MSG            := '';

    -- ﾌｧｲﾙﾊﾟｽの取得
    WK_V_PATH := E.OF_CONST('HB_JYUCHU_DIR');
    -- << データ取得 >> ---------------------------------------------
    -- ｵﾝﾗｲﾝ受信ﾌｧｲﾙを開く
    IF UTL_FILE.IS_OPEN(WK_FILE_HANDLE) = FALSE THEN
      -- ファイルリストオープン
      WK_FILE_HANDLE := UTL_FILE.FOPEN(WK_V_PATH, IN_FILE_NM, 'R');
    END IF;

    --　ｵﾝﾗｲﾝ受信ファイルを順に読込み、ﾚｺｰﾄﾞ区分（ｴﾝﾄﾞﾚｺｰﾄﾞ、ｽﾀｰﾄﾚｺｰﾄﾞ、1ﾚｺｰﾄﾞがすべて空白以外）のﾁｪｯｸを行う　
    LOOP UTL_FILE.GET_LINE(WK_FILE_HANDLE, WK_V_WRITCHAR);

      -- エンドレコードのレコード区分（'END  '）になるまで処理を行う
      EXIT WHEN SUBSTRB(WK_V_WRITCHAR, 1, 5) = STR_END;

      --1ﾚｺｰﾄﾞがすべて空白以外のﾁｪｯｸを行う
      IF TRIM(WK_V_WRITCHAR) IS NOT NULL THEN

        --ｽﾀｰﾄﾚｺｰﾄﾞのレコード区分（'START'）以外のﾁｪｯｸを行う
        IF TRIM(SUBSTRB(WK_V_WRITCHAR, 1, 5)) <> STR_START THEN${commentFeature}

          -- レコード区分を変数に代入
          STR_REC_KBN := TRIM(SUBSTRB(WK_V_WRITCHAR, 1, 1));
          OUT_DATA_KENSU          := OUT_DATA_KENSU + 1; -- タグ Bのレコードの場合、件数をカウントして戻り値・伝票枚数にセット。
`
  return startToCompare;
}

function Insert_T_REL_To_End_BO_Common(parse_json_mapping, json_table_T_REL, namePhysicTableT_REL, namePhysicTableWK, namePKG) {
  // Chon loai Batch se duoc gen
  var type = $("#typeBatch option:selected").val();

  switch (type) {
    case "BO_L_B_D":
      var whereExtend = '\r      AND DM_REC_KBN IS NOT NULL';
      break;
    case "BO_A_B_C_D_E":
      var whereExtend = '\r      AND H_FORMAT_ID IS NOT NULL';
      break;
    default:
      var whereExtend = '';
  }

  var outputInsert = `
    -- ${namePhysicTableWK}から{namePhysicTableT_REL}を挿入する
    INSERT INTO ${namePhysicTableT_REL}
      (CO_CD                     -- 会社コード
      ,EIGYO_CD                  -- 営業所コード
      ,SHUHAISHIN1_CD            -- 集配信コード（一次店）
      ,SHUHAISHIN2_CD            -- 集配信コード（二次店）
      ,SHUHAISHIN3_CD            -- 集配信コード（三次店）
      ,SHUHAISHIN_SEQ            -- 集配信連番
      ,SHUHAISHIN_SEQ_NO         -- 集配信連番内SEQ
      ,JYUSHIN_YMD               -- 受信日
      ,JYUSHIN_TIME              -- 受信時刻
      ,JYUSHIN_USER_CD           -- 受信者CD

`;
  var outputSelect = `

      ,UPD_CNT                   -- 更新回数
      ,DEL_FLG                   -- 削除フラグ
      ,INS_DATETIME              -- 登録日時
      ,INS_USER_CD               -- 登録者(CD)
      ,INS_PG                    -- 登録PG
      ,UPD_DATETIME              -- 更新日時
      ,UPD_USER_CD               -- 更新者(CD)
      ,UPD_PG)                   -- 更新PG
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
      ,NVL(H_DENPYO_NO, '0')                       AS       DT_DENPYO_NO

`;

  var outputWhere = `

      ,1
      ,E.FN_削除フラグ('有効')
      ,SYSTIMESTAMP(3)
      ,C_USER_ID
      ,C_PGID
      ,SYSTIMESTAMP(3)
      ,C_USER_ID
      ,C_PGID

    FROM WK_E_ORD_YAMADA_STORE
    WHERE CO_CD            = IN_CO_CD
      AND EIGYO_CD         = IN_EIGYO_CD
      AND SHUHAISHIN_SEQ   = IN_SHUHAISHIN_SEQ${whereExtend}
    ORDER BY WORKSHUHAISHIN_SEQ_NO;

    --ｵﾝﾗｲﾝ受信ﾌｧｲﾙを閉じる
    IF UTL_FILE.IS_OPEN(WK_FILE_HANDLE) = TRUE THEN
      UTL_FILE.FCLOSE(WK_FILE_HANDLE);
    END IF;

    /********1*********2*********3*********4*********5*********6*********7*********8*********9*********10********11********12********13********14********15********16********
    * エラー処理    ：共通仕様の為、変更しないでくさい
    ********1*********2*********3*********4*********5*********6*********7*********8*********9*********10********11********12********13********14********15********16********/
    <<ERR>>
    --ｵﾝﾗｲﾝ受信ﾌｧｲﾙを閉じる
    IF UTL_FILE.IS_OPEN(WK_FILE_HANDLE) = TRUE THEN
      UTL_FILE.FCLOSE(WK_FILE_HANDLE);
    END IF;
    --終了
    RETURN;

    EXCEPTION
      WHEN OTHERS THEN
        --ｵﾝﾗｲﾝ受信ﾌｧｲﾙを閉じる
        IF UTL_FILE.IS_OPEN(WK_FILE_HANDLE) = TRUE THEN
          UTL_FILE.FCLOSE(WK_FILE_HANDLE);
        END IF;
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
      var keyOfNmPhysicColumnTableT_REL = Object.keys(parse_json_mapping[x])[1];
      var nmPhysicColumnTableT_REL = parse_json_mapping[x][keyOfNmPhysicColumnTableT_REL];  // ten vat ly cua t_rel
      var keyOfComment = Object.keys(parse_json_mapping[x])[0];
      var Comment = parse_json_mapping[x][keyOfComment];                // ten logic cua t_rel
      let spaceBeforeComment = "                          ".slice(nmPhysicColumnTableT_REL.length);
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

      let spaceBeforeAs = "                                             ".slice(nullValue.length);
      outputSelect += "      " + nullValue + spaceBeforeAs + "AS       " + nmPhysicColumnTableT_REL + "\r";
    }
  }
  return output = outputInsert + outputSelect + outputWhere;
}