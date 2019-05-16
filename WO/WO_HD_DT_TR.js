function Compare_To_Declare_WO_HD_DT_TR() {
  let compare = `
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

  return compare;
} 


function Declare_To_SubStrb_WO_HD_DT_TR(json_table_WK) {
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

function SubStrb_To_Insert_WK_WO_HD_DT_TR(json_table_WK) {
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

  var posOfHD = 3;
  var posOfDT = 3;
  var posOfTR = 3;
  for (var i in json_table_WK) {
    var firstChar = json_table_WK[i].PHY_NM.slice(0, 1);

    if (firstChar == "H") {
      let phyNm = json_table_WK[i].PHY_NM;
      if (phyNm !== "H_TAG") {
        let spaceAfterPhysicNm = "                         ".slice(phyNm.length);

        let digit = json_table_WK[i].DIGIT;
        let subStrb = `:=           SUBSTRB(WK_DATA_ROW, ${posOfHD}, ${digit});`
        let logicNm = json_table_WK[i].LOG_NM;
        let lenSubStrb = posOfHD.toString().length + digit.toString().length;
        let spaceAfterSubStrb = "        -- ".slice(lenSubStrb);

        wkTagHD += "          REC." + phyNm + spaceAfterPhysicNm + subStrb + spaceAfterSubStrb + logicNm + "\r";
        posOfHD = posOfHD + Number(digit);
      }
    }

    if (firstChar == "M") {
      let phyNm = json_table_WK[i].PHY_NM.slice(2);
      if (phyNm !== "TAG") {
        let spaceAfterPhysicNm = "                      ".slice(phyNm.length);

        let digit = json_table_WK[i].DIGIT;
        let subStrb = `:=           SUBSTRB(WK_DATA_ROW, ${posOfDT}, ${digit});`
        let logicNm = json_table_WK[i].LOG_NM;
        let lenSubStrb = posOfDT.toString().length + digit.toString().length;
        let spaceAfterSubStrb = "        -- ".slice(lenSubStrb);

        wkTagDT += "          TYPE_D." + phyNm + spaceAfterPhysicNm + subStrb + spaceAfterSubStrb + logicNm + "\r";
        posOfDT = posOfDT + Number(digit);
      }
    }

    if (firstChar == "T") {
      let phyNm = json_table_WK[i].PHY_NM;
      if (phyNm !== "T_TAG") {
        let spaceAfterPhysicNm = "                         ".slice(phyNm.length);

        let digit = json_table_WK[i].DIGIT;
        let subStrb = `:=           SUBSTRB(WK_DATA_ROW, ${posOfTR}, ${digit});`
        let logicNm = json_table_WK[i].LOG_NM;
        let lenSubStrb = posOfTR.toString().length + digit.toString().length;
        let spaceAfterSubStrb = "        -- ".slice(lenSubStrb);

        wkTagTR += "          REC." + phyNm + spaceAfterPhysicNm + subStrb + spaceAfterSubStrb + logicNm + "\r";
        posOfTR = posOfTR + Number(digit);
      }
    }
  }
  output = wkTagHD + wkTagDT + wkTagTR;
  return output
}

function Insert_WK_To_Insert_T_REL_WO_HD_DT_TR(json_table_WK, namePhysicTableWK) {
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
                ,E.FN_削除フラグ('有効')
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
