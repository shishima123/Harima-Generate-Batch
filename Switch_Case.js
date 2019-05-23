function switchCase(type,namePKG,nameJapanOfPkg,parse_json_mapping,json_table_WK,json_table_T_REL,namePhysicTableT_REL,namePhysicTableWK) {
    console.log(type)
    debugger;
    switch (type) {
        case "GEN_MAPPING":
            var insertT_RELToEnd = Gen_Mapping(parse_json_mapping, json_table_T_REL, namePhysicTableT_REL, namePhysicTableWK, namePKG);
            var output = insertT_RELToEnd;
            break;
        case "WO_HD_DT_TR":
            var startToCompare = Start_To_Compare_WO_Common(namePKG, nameJapanOfPkg, namePhysicTableT_REL, namePhysicTableWK);
            var compareToDeclare = Compare_To_Declare_WO_HD_DT_TR();
            var declareToSubStrb = Declare_To_SubStrb_WO_HD_DT_TR(json_table_WK);
            var subStrbToInsertWK = SubStrb_To_Insert_WK_WO_HD_DT_TR(json_table_WK);
            var insertWKToInsertT_REL = Insert_WK_To_Insert_T_REL_WO_HD_DT_TR(json_table_WK, namePhysicTableWK);
            var insertT_RELToEnd = Insert_T_REL_To_End_WO_Common(parse_json_mapping, json_table_T_REL, namePhysicTableT_REL, namePhysicTableWK, namePKG);

            var output = startToCompare + compareToDeclare + declareToSubStrb + subStrbToInsertWK + insertWKToInsertT_REL + insertT_RELToEnd;

            break;
        case "WO_HD_DT":
            var startToCompare = Start_To_Compare_WO_Common(namePKG, nameJapanOfPkg, namePhysicTableT_REL, namePhysicTableWK);
            var compareToSubStrb = Compare_To_SubStrb_WO_HD_DT();
            var subStrbToInsertWK = SubStrb_To_Insert_WK_WO_HD_DT(json_table_WK);
            var insertWKToInsertT_REL = Insert_WK_To_Insert_T_REL_WO_HD_DT(json_table_WK, namePhysicTableWK);
            var insertT_RELToEnd = Insert_T_REL_To_End_WO_Common(parse_json_mapping, json_table_T_REL, namePhysicTableT_REL, namePhysicTableWK, namePKG);

            var output = startToCompare + compareToSubStrb + subStrbToInsertWK + insertWKToInsertT_REL + insertT_RELToEnd;

        case "WO_19_Items":
            var output1 = Start_To_Compare_WO_19_Items(namePKG, nameJapanOfPkg, namePhysicTableT_REL, namePhysicTableWK);
            var output2 = Compare_To_SubStrb_WO_19_Items();
            var output3 = SubStrb_To_Insert_WK_WO_19_Items(json_table_WK);
            var output4 = Insert_WK_To_Insert_T_REL_WO_19_Items(json_table_WK, namePhysicTableWK);
            var insertT_RELToEnd = Insert_T_REL_To_End_WO_19_Items(parse_json_mapping, json_table_T_REL, namePhysicTableT_REL, namePhysicTableWK, namePKG);
            var output = output1 + output2 + output3 + output4 + insertT_RELToEnd;
            break;

        case "WO_Line_Blank":
            var output1 = Start_To_SubStrb_WO_Line_Blank(namePKG, nameJapanOfPkg, namePhysicTableT_REL, namePhysicTableWK);
            var output2 = SubStrb_To_Insert_WK_WO_Line_Blank(json_table_WK);
            var output3 = Insert_WK_To_Insert_T_REL_WO_Line_Blank(json_table_WK, namePhysicTableWK);
            var insertT_RELToEnd = Insert_T_REL_To_End_WO_Line_Blank(parse_json_mapping, json_table_T_REL, namePhysicTableT_REL, namePhysicTableWK, namePKG);
            var output = output1 + output2 + output3 + insertT_RELToEnd;
            break;

        case "WO_If_Not_19_Items":
            var output1 = Start_To_Compare_WO_If_Not_19_Items(namePKG, nameJapanOfPkg, namePhysicTableT_REL, namePhysicTableWK);
            var output2 = SubStrb_To_Insert_WK_WO_If_Not_19_Items(json_table_WK);
            var output3 = Insert_WK_To_Insert_T_REL_WO_If_Not_19_Items(json_table_WK, namePhysicTableWK);
            var insertT_RELToEnd = Insert_T_REL_To_End_WO_If_Not_19_Items(parse_json_mapping, json_table_T_REL, namePhysicTableT_REL, namePhysicTableWK, namePKG);
            var output = output1 + output2 + output3 + insertT_RELToEnd;
            break;

        case "WO_50_51":
            var output1 = Start_To_Declare_WO_50_51(namePKG, nameJapanOfPkg, namePhysicTableT_REL, namePhysicTableWK);
            var output2 = Declare_To_SubStrb_WO_50_51(json_table_WK);
            var output3 = SubStrb_To_Insert_T_REL_WO_50_51(json_table_WK, namePhysicTableWK);
            var insertT_RELToEnd = Insert_T_REL_To_End_WO_50_51(parse_json_mapping, json_table_T_REL, namePhysicTableT_REL, namePhysicTableWK, namePKG);
            var output = output1 + output2 + output3 + insertT_RELToEnd;
            break;

        case "WO_70_10_11":
            var output1 = Start_To_SubStrb_WO_70_10_11(namePKG, nameJapanOfPkg, namePhysicTableT_REL, namePhysicTableWK);
            var output2 = SubStrb_To_Tag_70_WO_70_10_11(json_table_WK, namePhysicTableWK);
            var output3 = Tag70_To_Tag_11_WO_70_10_11(json_table_WK, namePhysicTableWK);
            var insertT_RELToEnd = Insert_T_REL_To_End_WO_70_10_11(parse_json_mapping, json_table_T_REL, namePhysicTableT_REL, namePhysicTableWK, namePKG);
            var output = output1 + output2 + output3 + insertT_RELToEnd;
            break;

        case "BO_L_B_D":
            var startToCompare = Start_To_Compare_BO_Common(namePKG, nameJapanOfPkg, namePhysicTableT_REL, namePhysicTableWK);
            var compareToDeclare = Compare_To_Declare_BO_L_B_D();
            var declareToSubStrb = Declare_To_SubStrbL_BO_L_B_D(json_table_WK);
            var subStrbLToSubStrbBD = SubStrbL_To_SubStrbBD_BO_L_B_D(json_table_WK, namePhysicTableWK);
            var subStrbBDToInsertT_REL = SubStrbBD_To_Insert_T_REL_BO_L_B_D(json_table_WK, namePhysicTableWK);
            var insertT_RELToEnd = Insert_T_REL_To_End_BO_Common(parse_json_mapping, json_table_T_REL, namePhysicTableT_REL, namePhysicTableWK, namePKG);

            var output = startToCompare + compareToDeclare + declareToSubStrb + subStrbLToSubStrbBD + subStrbBDToInsertT_REL + insertT_RELToEnd;
            break;

        case "BO_A_B_C_D_E":
            var startToCompare = Start_To_Compare_BO_Common(namePKG, nameJapanOfPkg, namePhysicTableT_REL, namePhysicTableWK);
            var compareToDeclare = Compare_To_Declare_BO_A_B_C_D_E();
            var declareToSubStrbA = Declare_To_SubStrbA_BO_A_B_C_D_E(json_table_WK);
            var subStrbAToSubStrbBCDE = SubStrbA_To_SubStrbBCDE_BO_A_B_C_D_E(json_table_WK, namePhysicTableWK);
            var subStrbBCDEToInsertT_REL = SubStrbBCDE_To_Insert_T_REL_BO_A_B_C_D_E(json_table_WK, namePhysicTableWK);
            var insertT_RELToEnd = Insert_T_REL_To_End_BO_Common(parse_json_mapping, json_table_T_REL, namePhysicTableT_REL, namePhysicTableWK, namePKG);

            var output = startToCompare + compareToDeclare + declareToSubStrbA + subStrbAToSubStrbBCDE + subStrbBCDEToInsertT_REL + insertT_RELToEnd;
            break;

        case "BO_A_B_D_E":
            var startToCompare = Start_To_Compare_BO_Common(namePKG, nameJapanOfPkg, namePhysicTableT_REL, namePhysicTableWK);
            var compareToDeclare = Compare_To_Declare_BO_A_B_D_E();
            var declareToSubStrb = Declare_To_SubStrbL_BO_A_B_D_E(json_table_WK);
            var subStrbAToSubStrbBDE = SubStrbA_To_SubStrbBDE_BO_A_B_D_E(json_table_WK, namePhysicTableWK);
            var subStrbBDToInsertT_REL = SubStrbBDE_To_Insert_T_REL_BO_A_B_D_E(json_table_WK, namePhysicTableWK);
            var insertT_RELToEnd = Insert_T_REL_To_End_BO_Common(parse_json_mapping, json_table_T_REL, namePhysicTableT_REL, namePhysicTableWK, namePKG);

            var output = startToCompare + compareToDeclare + declareToSubStrb + subStrbAToSubStrbBDE + subStrbBDToInsertT_REL + insertT_RELToEnd;
            break;

        case "BO_Line_Blank":
            var startToSubStrb = Start_To_Substrb_BO_Line_Blank(namePKG, nameJapanOfPkg, namePhysicTableWK);
            var subStrbToInsertWK = SubStrb_To_Insert_WK_BO_Line_Blank(json_table_WK);
            var insertWKToT_REl = Insert_WK_To_T_REL_BO_Line_Blank(json_table_WK, namePhysicTableWK);
            var insertT_RELToEnd = Insert_T_REL_To_End_BO_Line_Blank(parse_json_mapping, json_table_T_REL, namePhysicTableT_REL, namePhysicTableWK, namePKG);
            var output = startToSubStrb + subStrbToInsertWK + insertWKToT_REl + insertT_RELToEnd;
            break;

        case "BO_B_D":
            var startToSubStrb = Start_To_Compare_BO_Common(namePKG, nameJapanOfPkg, namePhysicTableWK);
            var compareToSubStrb = Compare_To_SubStrb_BO_B_D();
            var subStrToInsertT_REL = SubStrbBD_To_Insert_T_REL_BO_B_D(json_table_WK, namePhysicTableWK);
            var insertT_RELToEnd = Insert_T_REL_To_End_BO_Common(parse_json_mapping, json_table_T_REL, namePhysicTableT_REL, namePhysicTableWK, namePKG);

            var output = startToSubStrb + compareToSubStrb + subStrToInsertT_REL + insertT_RELToEnd;
            break;
        default:
    }
    return output;
}