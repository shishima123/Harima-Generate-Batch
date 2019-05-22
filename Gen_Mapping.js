function Gen_Mapping(parse_json_mapping, json_table_T_REL, namePhysicTableT_REL, namePhysicTableWK, namePKG) {

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
`;
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