function Compare_To_SubStrb_WO_HD_DT() {
  let compare = `
      IF WK_TAG = 'HD' THEN -- タグ HDのレコードの場合、件数をカウントして戻り値・伝票枚数にセット。
        OUT_DENPYO_KENSU := OUT_DENPYO_KENSU + 1;
      ELSIF WK_TAG = 'DT' THEN -- タグ DTのレコードの場合、件数をカウントして戻り値・明細件数にセット。
        OUT_MEISAI_KENSU := OUT_MEISAI_KENSU + 1;
      END IF;

      -- レコード件数をカウントする。
      OUT_DATA_KENSU := OUT_DATA_KENSU + 1;

      -- エラーになった場合は最初にエラーになった情報を戻り値にセットして処理を終了する。
      IF WK_TAG != 'HD' AND WK_TAG != 'DT' THEN
        OUT_ERR_CD   := STR_ERRCD_E10;
        OUT_ERR_MSG  := STR_ERRMSG_E10;
        RETURN;
      ELSIF OUT_DATA_KENSU = 1 AND WK_TAG != 'HD' THEN
        OUT_ERR_CD   := STR_ERRCD_E11;
        OUT_ERR_MSG  := STR_ERRMSG_E11;
        RETURN;
      ELSIF OUT_DATA_KENSU > 1 AND (( WK_TAG_PRE = 'HD' AND WK_TAG != 'DT')
                               OR ( WK_TAG_PRE = 'DT' AND (WK_TAG != 'HD' AND WK_TAG != 'DT'))) THEN
        OUT_ERR_CD   := STR_ERRCD_E11;
        OUT_ERR_MSG  := STR_ERRMSG_E11;
        RETURN;
      END IF;

      -- 本レコードのタグを変数に格納する。
      WK_TAG_PRE := WK_TAG;
    END LOOP;

    REC.WORKSHUHAISHIN_SEQ_NO := 0;

    ------------------- BEGIN
    BEGIN
      FOR vRECD IN
      (
        SELECT JT.DATA_ROW AS DATA_ROW
        FROM
          JSON_TABLE(IN_JSON_DATA,'$.DATA[*]'
            COLUMNS(
              DATA_ROW  PATH '$'
            )) AS JT
      ) LOOP

        WK_DATA_ROW := vRECD.DATA_ROW;

        -- レコードはスタートレコードと空白のレコードの場合、ループを続ける
        CONTINUE WHEN TRIM(WK_DATA_ROW) IS NULL;

        -- タグを取得して変数にセットする
        WK_TAG := TRIM(SUBSTRB(WK_DATA_ROW, 1, 2));`;

  return compare;
} 

function SubStrb_To_Insert_WK_WO_HD_DT(json_table_WK) {
    let wkTagHD = 
`         IF WK_TAG = 'HD' THEN
          REC.H_TAG                    :=           WK_TAG;                          -- ヘッダー_タグ
`;

    let wkTagDT = `

        ELSIF WK_TAG = 'DT' THEN
          REC.WORKSHUHAISHIN_SEQ_NO    :=           REC.WORKSHUHAISHIN_SEQ_NO + 1;   -- SEQを1に増やす
          REC.M_TAG                    :=           WK_TAG;                          -- 明細_タグ
`

  var startOfHD = 3;
  var startOfDT = 3;

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
        startOfHD = startOfHD + Number(digit);
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
        startOfDT = startOfDT + Number(digit);
      }
    }

  }
  output = wkTagHD + wkTagDT;
  return output
}

function Insert_WK_To_Insert_T_REL_WO_HD_DT(json_table_WK, namePhysicTableWK) {
  let startInsertWK = `

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
            ,REC.WORKSHUHAISHIN_SEQ_NO
            ,WK_JYUSHIN_YMD
            ,WK_JYUSHIN_TIME
            ,IN_JYUSHIN_USER_CD
`;

  let endInsertWK = `
            ,1
            ,E.FN_削除フラグ('有効')
            ,SYSTIMESTAMP(3)
            ,IN_JYUSHIN_USER_CD
            ,C_PGID
            ,SYSTIMESTAMP(3)
            ,IN_JYUSHIN_USER_CD
            ,C_PGID
            );
        END IF;

      END LOOP;

    END; -- BEGIN完了
`

  for (var i in json_table_WK) {
    let namePhysic = json_table_WK[i].PHY_NM;
    let nameLogic = json_table_WK[i].LOG_NM;
    let firstChar = namePhysic.slice(0, 1);
    if (namePhysic == 'CO_CD') {
      spaceFirst = "            (";
    } else {
      spaceFirst = "            ,";
    }

    spaceAfterColumnNm = "                                      -- ".slice(namePhysic.length)
    // thoat vong lap neu gap phai YOBI
    if (firstChar == "Y") {
      break;
    } else {
      startInsertWK += spaceFirst + namePhysic + spaceAfterColumnNm +  nameLogic + "\r";
    }

    if (firstChar == "H" || firstChar == "M") {
      midInsertWK += spaceFirst + "REC." + namePhysic + "\r";
    }
  }
  var output = startInsertWK + "\n" + midInsertWK + "\n" + endInsertWK;
  return output;
}