/**
 * Mock family tree data for local development / demo.
 *
 * Test IDs:
 *   Unified ID : P0020375801  → Ahmed Al Mansouri (root demo, deep tree)
 *   Emirates ID: 784-1985-1234567-1
 *   Passport   : PA22710627
 *
 *   Unified ID : P0099887766  → Khalid Al Rashidi (resident demo)
 *   Passport   : XB99887766
 *
 * The Ahmed tree is intentionally large to exercise overlap handling:
 *   - 4 great-grandparents
 *   - 4 grandparents (paternal + maternal)
 *   - 2 parents + 3 paternal aunts/uncles + 2 maternal aunts/uncles
 *   - root + 2 wives + 3 siblings
 *   - 5 children (3 with wife 1, 2 with wife 2)
 *   - 7 grandchildren spread across 4 children
 */

const P = (props) => ({ ...props });

export const MOCK_PEOPLE = {
  // ── Great-grandparents (paternal-paternal line) ──────────────────────────
  "P0000000900": P({
    id: "P0000000900", unified_id: "P0000000900",
    full_name: "Saeed Al Mansouri", name_eng: "Saeed Al Mansouri", name_arabic: "سعيد المنصوري",
    dob: "1915-04-12", passport_no: "PA00000900", passport: "PA00000900",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID0000000900", person_type: "citizen", kin: "grandfather",
  }),
  "P0000000901": P({
    id: "P0000000901", unified_id: "P0000000901",
    full_name: "Hessa Bint Rashid", name_eng: "Hessa Bint Rashid", name_arabic: "حصة بنت راشد",
    dob: "1918-08-22", passport_no: "PA00000901", passport: "PA00000901",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID0000000901", person_type: "citizen", kin: "grandmother",
  }),

  // ── Grandparents: paternal ───────────────────────────────────────────────
  "P0000000001": P({
    id: "P0000000001", unified_id: "P0000000001",
    full_name: "Abdul Rahman Al Mansouri", name_eng: "Abdul Rahman Al Mansouri", name_arabic: "عبد الرحمن المنصوري",
    dob: "1940-06-10", passport_no: "PA00000001", passport: "PA00000001",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID0000000001", person_type: "citizen", kin: "grandfather",
  }),
  "P0000000002": P({
    id: "P0000000002", unified_id: "P0000000002",
    full_name: "Sheikha Bint Hamdan", name_eng: "Sheikha Bint Hamdan", name_arabic: "شيخة بنت حمدان",
    dob: "1944-02-20", passport_no: "PA00000002", passport: "PA00000002",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID0000000002", person_type: "citizen", kin: "grandmother",
  }),

  // ── Grandparents: maternal ───────────────────────────────────────────────
  "P0000000003": P({
    id: "P0000000003", unified_id: "P0000000003",
    full_name: "Mohammed Al Zaabi", name_eng: "Mohammed Al Zaabi", name_arabic: "محمد الزعبي",
    dob: "1942-11-05", passport_no: "PA00000003", passport: "PA00000003",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID0000000003", person_type: "citizen", kin: "grandfather",
  }),
  "P0000000004": P({
    id: "P0000000004", unified_id: "P0000000004",
    full_name: "Maryam Bint Saeed", name_eng: "Maryam Bint Saeed", name_arabic: "مريم بنت سعيد",
    dob: "1946-07-18", passport_no: "PA00000004", passport: "PA00000004",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID0000000004", person_type: "citizen", kin: "grandmother",
  }),

  // ── Parents ──────────────────────────────────────────────────────────────
  "P0010000010": P({
    id: "P0010000010", unified_id: "P0010000010",
    full_name: "Hassan Abdul Al Mansouri", name_eng: "Hassan Abdul Al Mansouri", name_arabic: "حسن عبد المنصوري",
    dob: "1960-04-22", passport_no: "PA10000010", passport: "PA10000010",
    contact_no: "+971521112233", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID1000000010", person_type: "citizen", kin: "father",
  }),
  "P0010000011": P({
    id: "P0010000011", unified_id: "P0010000011",
    full_name: "Fatima Mohammed Al Zaabi", name_eng: "Fatima Mohammed Al Zaabi", name_arabic: "فاطمة محمد الزعبي",
    dob: "1963-09-30", passport_no: "PA10000011", passport: "PA10000011",
    contact_no: "+971521112244", nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID1000000011", person_type: "citizen", kin: "mother",
  }),

  // Paternal uncles/aunts
  "P0010000020": P({
    id: "P0010000020", unified_id: "P0010000020",
    full_name: "Salem Abdul Al Mansouri", name_eng: "Salem Abdul Al Mansouri", name_arabic: "سالم عبد المنصوري",
    dob: "1958-01-15", passport_no: "PA10000020", passport: "PA10000020",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID1000000020", person_type: "citizen", kin: "uncle",
  }),
  "P0010000021": P({
    id: "P0010000021", unified_id: "P0010000021",
    full_name: "Hamad Abdul Al Mansouri", name_eng: "Hamad Abdul Al Mansouri", name_arabic: "حمد عبد المنصوري",
    dob: "1965-09-09", passport_no: "PA10000021", passport: "PA10000021",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID1000000021", person_type: "citizen", kin: "uncle",
  }),
  "P0010000022": P({
    id: "P0010000022", unified_id: "P0010000022",
    full_name: "Aisha Abdul Al Mansouri", name_eng: "Aisha Abdul Al Mansouri", name_arabic: "عائشة عبد المنصوري",
    dob: "1962-06-30", passport_no: "PA10000022", passport: "PA10000022",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID1000000022", person_type: "citizen", kin: "aunt",
  }),

  // Maternal uncles/aunts
  "P0010000030": P({
    id: "P0010000030", unified_id: "P0010000030",
    full_name: "Khalifa Mohammed Al Zaabi", name_eng: "Khalifa Mohammed Al Zaabi", name_arabic: "خليفة محمد الزعبي",
    dob: "1961-03-18", passport_no: "PA10000030", passport: "PA10000030",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID1000000030", person_type: "citizen", kin: "uncle",
  }),
  "P0010000031": P({
    id: "P0010000031", unified_id: "P0010000031",
    full_name: "Latifa Mohammed Al Zaabi", name_eng: "Latifa Mohammed Al Zaabi", name_arabic: "لطيفة محمد الزعبي",
    dob: "1965-11-04", passport_no: "PA10000031", passport: "PA10000031",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID1000000031", person_type: "citizen", kin: "aunt",
  }),

  // ── Root + Spouses + Siblings ────────────────────────────────────────────
  "P0020375801": P({
    id: "P0020375801", unified_id: "P0020375801",
    full_name: "Ahmed Hassan Al Mansouri", name_eng: "Ahmed Hassan Al Mansouri", name_arabic: "أحمد حسن المنصوري",
    dob: "1985-03-15", passport_no: "PA22710627", passport: "PA22710627",
    contact_no: "+971501234567", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID2037580001", person_type: "citizen", kin: "self",
  }),
  "P0020375802": P({
    id: "P0020375802", unified_id: "P0020375802",
    full_name: "Mariam Saeed Al Rashidi", name_eng: "Mariam Saeed Al Rashidi", name_arabic: "مريم سعيد الراشدي",
    dob: "1988-07-25", passport_no: "PA22710628", passport: "PA22710628",
    contact_no: "+971509876543", nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID2037580002", person_type: "citizen", kin: "wife",
  }),
  "P0020375810": P({
    id: "P0020375810", unified_id: "P0020375810",
    full_name: "Noura Khalid Al Suwaidi", name_eng: "Noura Khalid Al Suwaidi", name_arabic: "نورة خالد السويدي",
    dob: "1991-02-10", passport_no: "PA22710640", passport: "PA22710640",
    contact_no: "+971507654321", nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID2037580010", person_type: "citizen", kin: "wife",
  }),
  "P0020375803": P({
    id: "P0020375803", unified_id: "P0020375803",
    full_name: "Omar Hassan Al Mansouri", name_eng: "Omar Hassan Al Mansouri", name_arabic: "عمر حسن المنصوري",
    dob: "1987-12-01", passport_no: "PA22710629", passport: "PA22710629",
    contact_no: "+971505551234", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID2037580003", person_type: "citizen", kin: "brother",
  }),
  "P0020375804": P({
    id: "P0020375804", unified_id: "P0020375804",
    full_name: "Layla Hassan Al Mansouri", name_eng: "Layla Hassan Al Mansouri", name_arabic: "ليلى حسن المنصوري",
    dob: "1990-05-12", passport_no: "PA22710630", passport: "PA22710630",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID2037580004", person_type: "citizen", kin: "sister",
  }),
  "P0020375805": P({
    id: "P0020375805", unified_id: "P0020375805",
    full_name: "Yousef Hassan Al Mansouri", name_eng: "Yousef Hassan Al Mansouri", name_arabic: "يوسف حسن المنصوري",
    dob: "1992-09-18", passport_no: "PA22710631", passport: "PA22710631",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID2037580005", person_type: "citizen", kin: "brother",
  }),

  // ── Children (gen -1) ────────────────────────────────────────────────────
  // Children of Mariam (wife 1)
  "P0030000100": P({
    id: "P0030000100", unified_id: "P0030000100",
    full_name: "Khalid Ahmed Al Mansouri", name_eng: "Khalid Ahmed Al Mansouri", name_arabic: "خالد أحمد المنصوري",
    dob: "2010-05-18", passport_no: "JPA30000100", passport: "JPA30000100",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID3000000100", person_type: "citizen", kin: "son",
  }),
  "P0030000101": P({
    id: "P0030000101", unified_id: "P0030000101",
    full_name: "Sara Ahmed Al Mansouri", name_eng: "Sara Ahmed Al Mansouri", name_arabic: "سارة أحمد المنصوري",
    dob: "2012-09-03", passport_no: "JPA30000101", passport: "JPA30000101",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID3000000101", person_type: "citizen", kin: "daughter",
  }),
  "P0030000103": P({
    id: "P0030000103", unified_id: "P0030000103",
    full_name: "Mansour Ahmed Al Mansouri", name_eng: "Mansour Ahmed Al Mansouri", name_arabic: "منصور أحمد المنصوري",
    dob: "2014-12-19", passport_no: "JPA30000103", passport: "JPA30000103",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID3000000103", person_type: "citizen", kin: "son",
  }),
  // Children of Noura (wife 2)
  "P0030000102": P({
    id: "P0030000102", unified_id: "P0030000102",
    full_name: "Zayed Ahmed Al Mansouri", name_eng: "Zayed Ahmed Al Mansouri", name_arabic: "زايد أحمد المنصوري",
    dob: "2018-01-22", passport_no: "JPA30000102", passport: "JPA30000102",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID3000000102", person_type: "citizen", kin: "son",
  }),
  "P0030000104": P({
    id: "P0030000104", unified_id: "P0030000104",
    full_name: "Hind Ahmed Al Mansouri", name_eng: "Hind Ahmed Al Mansouri", name_arabic: "هند أحمد المنصوري",
    dob: "2020-08-05", passport_no: "JPA30000104", passport: "JPA30000104",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID3000000104", person_type: "citizen", kin: "daughter",
  }),

  // ── Grandchildren (gen -2) ───────────────────────────────────────────────
  // Khalid's kids
  "P0040000200": P({
    id: "P0040000200", unified_id: "P0040000200",
    full_name: "Hassan Khalid Al Mansouri", name_eng: "Hassan Khalid Al Mansouri", name_arabic: "حسن خالد المنصوري",
    dob: "2030-04-10", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID4000000200", person_type: "citizen", kin: "grandson",
  }),
  "P0040000201": P({
    id: "P0040000201", unified_id: "P0040000201",
    full_name: "Reem Khalid Al Mansouri", name_eng: "Reem Khalid Al Mansouri", name_arabic: "ريم خالد المنصوري",
    dob: "2032-02-14", nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID4000000201", person_type: "citizen", kin: "granddaughter",
  }),
  // Sara's kids
  "P0040000202": P({
    id: "P0040000202", unified_id: "P0040000202",
    full_name: "Mohammed Sara Al Mansouri", name_eng: "Mohammed Sara Al Mansouri", name_arabic: "محمد سارة المنصوري",
    dob: "2034-06-21", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID4000000202", person_type: "citizen", kin: "grandson",
  }),
  "P0040000203": P({
    id: "P0040000203", unified_id: "P0040000203",
    full_name: "Amna Sara Al Mansouri", name_eng: "Amna Sara Al Mansouri", name_arabic: "آمنة سارة المنصوري",
    dob: "2036-01-09", nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID4000000203", person_type: "citizen", kin: "granddaughter",
  }),
  // Mansour's kid
  "P0040000204": P({
    id: "P0040000204", unified_id: "P0040000204",
    full_name: "Rashid Mansour Al Mansouri", name_eng: "Rashid Mansour Al Mansouri", name_arabic: "راشد منصور المنصوري",
    dob: "2038-10-30", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID4000000204", person_type: "citizen", kin: "grandson",
  }),
  // Zayed's kids
  "P0040000205": P({
    id: "P0040000205", unified_id: "P0040000205",
    full_name: "Sultan Zayed Al Mansouri", name_eng: "Sultan Zayed Al Mansouri", name_arabic: "سلطان زايد المنصوري",
    dob: "2042-03-18", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID4000000205", person_type: "citizen", kin: "grandson",
  }),
  "P0040000206": P({
    id: "P0040000206", unified_id: "P0040000206",
    full_name: "Shamma Zayed Al Mansouri", name_eng: "Shamma Zayed Al Mansouri", name_arabic: "شما زايد المنصوري",
    dob: "2044-07-25", nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID4000000206", person_type: "citizen", kin: "granddaughter",
  }),

  // ── Resident demo ────────────────────────────────────────────────────────
  "P0099887766": P({
    id: "P0099887766", unified_id: "P0099887766",
    full_name: "Khalid Rahman Al Rashidi", name_eng: "Khalid Rahman Al Rashidi", name_arabic: "خالد رحمن الراشدي",
    dob: "1990-08-15", passport_no: "XB99887766", passport: "XB99887766",
    contact_no: "+971551122334", nationality: "India", gender: "M", sex: "M",
    person_type: "resident", kin: "self",
  }),
  "P0099887767": P({
    id: "P0099887767", unified_id: "P0099887767",
    full_name: "Priya Khalid Al Rashidi", name_eng: "Priya Khalid Al Rashidi",
    dob: "1993-03-22", passport_no: "XB99887767", passport: "XB99887767",
    contact_no: "+971551122335", nationality: "India", gender: "F", sex: "F",
    person_type: "resident", kin: "wife",
  }),
  "P0099887768": P({
    id: "P0099887768", unified_id: "P0099887768",
    full_name: "Arjun Khalid Al Rashidi", name_eng: "Arjun Khalid Al Rashidi",
    dob: "2015-11-08", passport_no: "XB99887768", passport: "XB99887768",
    nationality: "India", gender: "M", sex: "M",
    person_type: "resident", kin: "son",
  }),
  "P0099887769": P({
    id: "P0099887769", unified_id: "P0099887769",
    full_name: "Kavya Khalid Al Rashidi", name_eng: "Kavya Khalid Al Rashidi",
    dob: "2018-06-14", passport_no: "XB99887769", passport: "XB99887769",
    nationality: "India", gender: "F", sex: "F",
    person_type: "resident", kin: "daughter",
  }),

  // ════════════════════════════════════════════════════════════════════════
  // Scenario A — Divorced + remarried (half-siblings on the children row)
  // Root: Salem Al Hammadi  (P0050000001)
  // ════════════════════════════════════════════════════════════════════════
  "P0050000050": P({
    id: "P0050000050", unified_id: "P0050000050",
    full_name: "Obaid Al Hammadi", name_eng: "Obaid Al Hammadi", name_arabic: "عبيد الحمادي",
    dob: "1948-03-12", passport_no: "PA50000050", passport: "PA50000050",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID5000000050", person_type: "citizen", kin: "father",
  }),
  "P0050000051": P({
    id: "P0050000051", unified_id: "P0050000051",
    full_name: "Salama Bint Khalifa", name_eng: "Salama Bint Khalifa", name_arabic: "سلامة بنت خليفة",
    dob: "1952-09-08", passport_no: "PA50000051", passport: "PA50000051",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID5000000051", person_type: "citizen", kin: "mother",
  }),
  "P0050000001": P({
    id: "P0050000001", unified_id: "P0050000001",
    full_name: "Salem Obaid Al Hammadi", name_eng: "Salem Obaid Al Hammadi", name_arabic: "سالم عبيد الحمادي",
    dob: "1978-06-22", passport_no: "PA50000001", passport: "PA50000001",
    contact_no: "+971502223333", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID5000000001", person_type: "citizen", kin: "self",
  }),
  "P0050000010": P({
    id: "P0050000010", unified_id: "P0050000010",
    full_name: "Hessa Saeed Al Marri", name_eng: "Hessa Saeed Al Marri", name_arabic: "حصة سعيد المري",
    dob: "1981-11-02", passport_no: "PA50000010", passport: "PA50000010",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID5000000010", person_type: "citizen", kin: "ex-wife",
  }),
  "P0050000011": P({
    id: "P0050000011", unified_id: "P0050000011",
    full_name: "Mona Khalid Al Suwaidi", name_eng: "Mona Khalid Al Suwaidi", name_arabic: "منى خالد السويدي",
    dob: "1986-04-19", passport_no: "PA50000011", passport: "PA50000011",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID5000000011", person_type: "citizen", kin: "wife",
  }),
  // Children with Hessa (from the divorced marriage)
  "P0050000020": P({
    id: "P0050000020", unified_id: "P0050000020",
    full_name: "Ahmed Salem Al Hammadi", name_eng: "Ahmed Salem Al Hammadi", name_arabic: "أحمد سالم الحمادي",
    dob: "2005-02-14", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID5000000020", person_type: "citizen", kin: "son",
  }),
  "P0050000021": P({
    id: "P0050000021", unified_id: "P0050000021",
    full_name: "Latifa Salem Al Hammadi", name_eng: "Latifa Salem Al Hammadi", name_arabic: "لطيفة سالم الحمادي",
    dob: "2007-08-30", nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID5000000021", person_type: "citizen", kin: "daughter",
  }),
  "P0050000022": P({
    id: "P0050000022", unified_id: "P0050000022",
    full_name: "Sultan Salem Al Hammadi", name_eng: "Sultan Salem Al Hammadi", name_arabic: "سلطان سالم الحمادي",
    dob: "2010-12-05", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID5000000022", person_type: "citizen", kin: "son",
  }),
  // Children with Mona (current marriage) — half-siblings to the above
  "P0050000023": P({
    id: "P0050000023", unified_id: "P0050000023",
    full_name: "Khalifa Salem Al Hammadi", name_eng: "Khalifa Salem Al Hammadi", name_arabic: "خليفة سالم الحمادي",
    dob: "2016-05-21", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID5000000023", person_type: "citizen", kin: "son",
  }),
  "P0050000024": P({
    id: "P0050000024", unified_id: "P0050000024",
    full_name: "Reem Salem Al Hammadi", name_eng: "Reem Salem Al Hammadi", name_arabic: "ريم سالم الحمادي",
    dob: "2019-09-09", nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID5000000024", person_type: "citizen", kin: "daughter",
  }),

  // ════════════════════════════════════════════════════════════════════════
  // Scenario B — Widow with multiple children (late husband still in tree)
  // Root: Jamila Al Falasi  (P0060000001)
  // ════════════════════════════════════════════════════════════════════════
  "P0060000050": P({
    id: "P0060000050", unified_id: "P0060000050",
    full_name: "Hamad Al Falasi", name_eng: "Hamad Al Falasi", name_arabic: "حمد الفلاسي",
    dob: "1942-07-04", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID6000000050", person_type: "citizen", kin: "father",
  }),
  "P0060000051": P({
    id: "P0060000051", unified_id: "P0060000051",
    full_name: "Aisha Bint Mohammed", name_eng: "Aisha Bint Mohammed", name_arabic: "عائشة بنت محمد",
    dob: "1945-10-17", nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID6000000051", person_type: "citizen", kin: "mother",
  }),
  "P0060000001": P({
    id: "P0060000001", unified_id: "P0060000001",
    full_name: "Jamila Hamad Al Falasi", name_eng: "Jamila Hamad Al Falasi", name_arabic: "جميلة حمد الفلاسي",
    dob: "1972-01-25", passport_no: "PA60000001", passport: "PA60000001",
    contact_no: "+971504445555", nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID6000000001", person_type: "citizen", kin: "self",
  }),
  "P0060000010": P({
    id: "P0060000010", unified_id: "P0060000010",
    full_name: "Mubarak Saeed Al Falasi", name_eng: "Mubarak Saeed Al Falasi", name_arabic: "مبارك سعيد الفلاسي",
    dob: "1968-03-30", date_of_death: "2020-06-15", deceased: true,
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID6000000010", person_type: "citizen", kin: "late-husband",
  }),
  "P0060000020": P({
    id: "P0060000020", unified_id: "P0060000020",
    full_name: "Saif Mubarak Al Falasi", name_eng: "Saif Mubarak Al Falasi", name_arabic: "سيف مبارك الفلاسي",
    dob: "1995-07-11", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID6000000020", person_type: "citizen", kin: "son",
  }),
  "P0060000021": P({
    id: "P0060000021", unified_id: "P0060000021",
    full_name: "Maitha Mubarak Al Falasi", name_eng: "Maitha Mubarak Al Falasi", name_arabic: "ميثا مبارك الفلاسي",
    dob: "1998-02-08", nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID6000000021", person_type: "citizen", kin: "daughter",
  }),
  "P0060000022": P({
    id: "P0060000022", unified_id: "P0060000022",
    full_name: "Hamdan Mubarak Al Falasi", name_eng: "Hamdan Mubarak Al Falasi", name_arabic: "حمدان مبارك الفلاسي",
    dob: "2001-06-19", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID6000000022", person_type: "citizen", kin: "son",
  }),
  "P0060000023": P({
    id: "P0060000023", unified_id: "P0060000023",
    full_name: "Shamsa Mubarak Al Falasi", name_eng: "Shamsa Mubarak Al Falasi", name_arabic: "شمسة مبارك الفلاسي",
    dob: "2004-11-23", nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID6000000023", person_type: "citizen", kin: "daughter",
  }),

  // ════════════════════════════════════════════════════════════════════════
  // Scenario C — Three marriages (ex-wife + late wife + current wife)
  // Root: Rashid Al Ameri  (P0070000001) — kids from each marriage are
  // half-siblings to one another.
  // ════════════════════════════════════════════════════════════════════════
  "P0070000050": P({
    id: "P0070000050", unified_id: "P0070000050",
    full_name: "Sultan Al Ameri", name_eng: "Sultan Al Ameri", name_arabic: "سلطان العامري",
    dob: "1940-11-11", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID7000000050", person_type: "citizen", kin: "father",
  }),
  "P0070000051": P({
    id: "P0070000051", unified_id: "P0070000051",
    full_name: "Mariam Bint Hamad", name_eng: "Mariam Bint Hamad", name_arabic: "مريم بنت حمد",
    dob: "1943-05-29", nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID7000000051", person_type: "citizen", kin: "mother",
  }),
  "P0070000001": P({
    id: "P0070000001", unified_id: "P0070000001",
    full_name: "Rashid Sultan Al Ameri", name_eng: "Rashid Sultan Al Ameri", name_arabic: "راشد سلطان العامري",
    dob: "1968-08-04", passport_no: "PA70000001", passport: "PA70000001",
    contact_no: "+971506667777", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID7000000001", person_type: "citizen", kin: "self",
  }),
  // Ex-wife (divorced)
  "P0070000010": P({
    id: "P0070000010", unified_id: "P0070000010",
    full_name: "Najla Khalifa Al Mazrouei", name_eng: "Najla Khalifa Al Mazrouei", name_arabic: "نجلاء خليفة المزروعي",
    dob: "1972-03-15", nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID7000000010", person_type: "citizen", kin: "ex-wife",
  }),
  // Late wife (deceased)
  "P0070000011": P({
    id: "P0070000011", unified_id: "P0070000011",
    full_name: "Wadeema Ahmed Al Shamsi", name_eng: "Wadeema Ahmed Al Shamsi", name_arabic: "وضيمة أحمد الشامسي",
    dob: "1975-09-22", date_of_death: "2015-04-10", deceased: true,
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID7000000011", person_type: "citizen", kin: "late-wife",
  }),
  // Current wife
  "P0070000012": P({
    id: "P0070000012", unified_id: "P0070000012",
    full_name: "Amna Saeed Al Nuaimi", name_eng: "Amna Saeed Al Nuaimi", name_arabic: "آمنة سعيد النعيمي",
    dob: "1980-12-30", nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID7000000012", person_type: "citizen", kin: "wife",
  }),
  // Kids with Najla (ex-wife)
  "P0070000020": P({
    id: "P0070000020", unified_id: "P0070000020",
    full_name: "Khalid Rashid Al Ameri", name_eng: "Khalid Rashid Al Ameri", name_arabic: "خالد راشد العامري",
    dob: "1995-01-12", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID7000000020", person_type: "citizen", kin: "son",
  }),
  "P0070000021": P({
    id: "P0070000021", unified_id: "P0070000021",
    full_name: "Salama Rashid Al Ameri", name_eng: "Salama Rashid Al Ameri", name_arabic: "سلامة راشد العامري",
    dob: "1998-06-08", nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID7000000021", person_type: "citizen", kin: "daughter",
  }),
  // Kid with Wadeema (late wife)
  "P0070000022": P({
    id: "P0070000022", unified_id: "P0070000022",
    full_name: "Yousef Rashid Al Ameri", name_eng: "Yousef Rashid Al Ameri", name_arabic: "يوسف راشد العامري",
    dob: "2008-03-17", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID7000000022", person_type: "citizen", kin: "son",
  }),
  // Kids with Amna (current wife)
  "P0070000023": P({
    id: "P0070000023", unified_id: "P0070000023",
    full_name: "Mansour Rashid Al Ameri", name_eng: "Mansour Rashid Al Ameri", name_arabic: "منصور راشد العامري",
    dob: "2014-10-25", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID7000000023", person_type: "citizen", kin: "son",
  }),
  "P0070000024": P({
    id: "P0070000024", unified_id: "P0070000024",
    full_name: "Hessa Rashid Al Ameri", name_eng: "Hessa Rashid Al Ameri", name_arabic: "حصة راشد العامري",
    dob: "2018-04-02", nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID7000000024", person_type: "citizen", kin: "daughter",
  }),

  // ════════════════════════════════════════════════════════════════════════
  // Scenario D — Single mother (never married, two children)
  // Root: Aisha Al Bloushi  (P0080000001)
  // ════════════════════════════════════════════════════════════════════════
  "P0080000050": P({
    id: "P0080000050", unified_id: "P0080000050",
    full_name: "Saeed Al Bloushi", name_eng: "Saeed Al Bloushi", name_arabic: "سعيد البلوشي",
    dob: "1955-02-19", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID8000000050", person_type: "citizen", kin: "father",
  }),
  "P0080000051": P({
    id: "P0080000051", unified_id: "P0080000051",
    full_name: "Fatima Bint Ali", name_eng: "Fatima Bint Ali", name_arabic: "فاطمة بنت علي",
    dob: "1958-12-06", nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID8000000051", person_type: "citizen", kin: "mother",
  }),
  "P0080000001": P({
    id: "P0080000001", unified_id: "P0080000001",
    full_name: "Aisha Saeed Al Bloushi", name_eng: "Aisha Saeed Al Bloushi", name_arabic: "عائشة سعيد البلوشي",
    dob: "1985-04-10", passport_no: "PA80000001", passport: "PA80000001",
    contact_no: "+971508889999", nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID8000000001", person_type: "citizen", kin: "self",
  }),
  "P0080000020": P({
    id: "P0080000020", unified_id: "P0080000020",
    full_name: "Hamad Aisha Al Bloushi", name_eng: "Hamad Aisha Al Bloushi", name_arabic: "حمد عائشة البلوشي",
    dob: "2012-07-14", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID8000000020", person_type: "citizen", kin: "son",
  }),
  "P0080000021": P({
    id: "P0080000021", unified_id: "P0080000021",
    full_name: "Mira Aisha Al Bloushi", name_eng: "Mira Aisha Al Bloushi", name_arabic: "ميرة عائشة البلوشي",
    dob: "2015-11-28", nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID8000000021", person_type: "citizen", kin: "daughter",
  }),

  // ════════════════════════════════════════════════════════════════════════
  // Scenario E — Childless couple with siblings on the side
  // Root: Faisal Al Qubaisi  (P0090000001)
  // ════════════════════════════════════════════════════════════════════════
  "P0090000050": P({
    id: "P0090000050", unified_id: "P0090000050",
    full_name: "Mohammed Al Qubaisi", name_eng: "Mohammed Al Qubaisi", name_arabic: "محمد القبيسي",
    dob: "1947-08-08", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID9000000050", person_type: "citizen", kin: "father",
  }),
  "P0090000051": P({
    id: "P0090000051", unified_id: "P0090000051",
    full_name: "Hessa Bint Saif", name_eng: "Hessa Bint Saif", name_arabic: "حصة بنت سيف",
    dob: "1950-04-21", nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID9000000051", person_type: "citizen", kin: "mother",
  }),
  "P0090000001": P({
    id: "P0090000001", unified_id: "P0090000001",
    full_name: "Faisal Mohammed Al Qubaisi", name_eng: "Faisal Mohammed Al Qubaisi", name_arabic: "فيصل محمد القبيسي",
    dob: "1980-06-30", passport_no: "PA90000001", passport: "PA90000001",
    contact_no: "+971501112222", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID9000000001", person_type: "citizen", kin: "self",
  }),
  "P0090000010": P({
    id: "P0090000010", unified_id: "P0090000010",
    full_name: "Latifa Hamad Al Qubaisi", name_eng: "Latifa Hamad Al Qubaisi", name_arabic: "لطيفة حمد القبيسي",
    dob: "1984-09-15", nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID9000000010", person_type: "citizen", kin: "wife",
  }),
  "P0090000030": P({
    id: "P0090000030", unified_id: "P0090000030",
    full_name: "Khalid Mohammed Al Qubaisi", name_eng: "Khalid Mohammed Al Qubaisi", name_arabic: "خالد محمد القبيسي",
    dob: "1982-02-11", nationality: "UAE", gender: "M", sex: "M",
    national_id: "NID9000000030", person_type: "citizen", kin: "brother",
  }),
  "P0090000031": P({
    id: "P0090000031", unified_id: "P0090000031",
    full_name: "Noura Mohammed Al Qubaisi", name_eng: "Noura Mohammed Al Qubaisi", name_arabic: "نورة محمد القبيسي",
    dob: "1985-12-02", nationality: "UAE", gender: "F", sex: "F",
    national_id: "NID9000000031", person_type: "citizen", kin: "sister",
  }),

  // ════════════════════════════════════════════════════════════════════════
  // Scenario F — Basic family (single wife, 2 children, 1 sibling)
  // Root: Ali Hassan Al Mazrouei  (E1)
  // ════════════════════════════════════════════════════════════════════════
  "E1": P({
    id: "E1", unified_id: "E1",
    full_name: "Ali Hassan Al Mazrouei", name_eng: "Ali Hassan Al Mazrouei", name_arabic: "علي حسن المزروعي",
    dob: "1990-05-15", date_of_birth: "1990-05-15",
    passport_no: "AE12345678", passport: "AE12345678", contact_no: "+971501234567",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "784-1990-1234567-1", person_type: "citizen", kin: "self",
  }),
  "E2": P({
    id: "E2", unified_id: "E2",
    full_name: "Hassan Ibrahim Al Mazrouei", name_eng: "Hassan Ibrahim Al Mazrouei", name_arabic: "حسن إبراهيم المزروعي",
    dob: "1965-03-20", date_of_birth: "1965-03-20",
    passport_no: "AE87654321", passport: "AE87654321", contact_no: "+971502345678",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "784-1965-8765432-1", person_type: "citizen", kin: "father",
  }),
  "E3": P({
    id: "E3", unified_id: "E3",
    full_name: "Mariam Saeed Al Mansoori", name_eng: "Mariam Saeed Al Mansoori", name_arabic: "مريم سعيد المنصوري",
    dob: "1968-07-10", date_of_birth: "1968-07-10",
    passport_no: "AE11223301", passport: "AE11223301", contact_no: "+971503456789",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "784-1968-1122334-2", person_type: "citizen", kin: "mother",
  }),
  "E4": P({
    id: "E4", unified_id: "E4",
    full_name: "Aisha Ali Al Zaabi", name_eng: "Aisha Ali Al Zaabi", name_arabic: "عائشة علي الزعابي",
    dob: "1992-11-25", date_of_birth: "1992-11-25",
    passport_no: "AE22334455", passport: "AE22334455", contact_no: "+971504567890",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "784-1992-2233445-2", person_type: "citizen", kin: "wife",
  }),
  "E5": P({
    id: "E5", unified_id: "E5",
    full_name: "Omar Ali Hassan", name_eng: "Omar Ali Hassan", name_arabic: "عمر علي حسن",
    dob: "2015-08-12", date_of_birth: "2015-08-12",
    passport_no: "AE33445566", passport: "AE33445566", contact_no: "+971505678901",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "784-2015-3344556-1", person_type: "citizen", kin: "son",
  }),
  "E6": P({
    id: "E6", unified_id: "E6",
    full_name: "Laila Ali Hassan", name_eng: "Laila Ali Hassan", name_arabic: "ليلى علي حسن",
    dob: "2018-02-28", date_of_birth: "2018-02-28",
    passport_no: "AE44556677", passport: "AE44556677", contact_no: "+971506789012",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "784-2018-4455667-2", person_type: "citizen", kin: "daughter",
  }),
  "E7": P({
    id: "E7", unified_id: "E7",
    full_name: "Fatima Hassan Al Mazrouei", name_eng: "Fatima Hassan Al Mazrouei", name_arabic: "فاطمة حسن المزروعي",
    dob: "1992-09-05", date_of_birth: "1992-09-05",
    passport_no: "AE55667788", passport: "AE55667788", contact_no: "+971507890123",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "784-1992-5566778-2", person_type: "citizen", kin: "sister",
  }),

  // ════════════════════════════════════════════════════════════════════════
  // Scenario G — Polygamy (3 concurrent wives, 6 kids split across them)
  // Root: Ahmed Khalid Al Suwaidi  (E10)
  // ════════════════════════════════════════════════════════════════════════
  "E10": P({
    id: "E10", unified_id: "E10",
    full_name: "Ahmed Khalid Al Suwaidi", name_eng: "Ahmed Khalid Al Suwaidi", name_arabic: "أحمد خالد السويدي",
    dob: "1985-04-18", date_of_birth: "1985-04-18",
    passport_no: "AE99887766", passport: "AE99887766", contact_no: "+971508901234",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "784-1985-9988776-1", person_type: "citizen", kin: "self",
  }),
  "E11": P({
    id: "E11", unified_id: "E11",
    full_name: "Khalid Mohammed Al Suwaidi", name_eng: "Khalid Mohammed Al Suwaidi", name_arabic: "خالد محمد السويدي",
    dob: "1960-01-15", date_of_birth: "1960-01-15",
    passport_no: "AE88776655", passport: "AE88776655", contact_no: "+971509012345",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "784-1960-8877665-1", person_type: "citizen", kin: "father",
  }),
  "E12": P({
    id: "E12", unified_id: "E12",
    full_name: "Salma Ahmed Al Nuaimi", name_eng: "Salma Ahmed Al Nuaimi", name_arabic: "سلمى أحمد النعيمي",
    dob: "1963-06-22", date_of_birth: "1963-06-22",
    passport_no: "AE77665544", passport: "AE77665544", contact_no: "+971501012345",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "784-1963-7766554-2", person_type: "citizen", kin: "mother",
  }),
  "E13": P({
    id: "E13", unified_id: "E13",
    full_name: "Fatima Ahmed Al Suwaidi", name_eng: "Fatima Ahmed Al Suwaidi", name_arabic: "فاطمة أحمد السويدي",
    dob: "1987-09-30", date_of_birth: "1987-09-30",
    passport_no: "AE66554433", passport: "AE66554433", contact_no: "+971501123456",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "784-1987-6655443-2", person_type: "citizen", kin: "wife",
  }),
  "E14": P({
    id: "E14", unified_id: "E14",
    full_name: "Zainab Ahmed Al Suwaidi", name_eng: "Zainab Ahmed Al Suwaidi", name_arabic: "زينب أحمد السويدي",
    dob: "1989-12-14", date_of_birth: "1989-12-14",
    passport_no: "AE55443322", passport: "AE55443322", contact_no: "+971501234500",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "784-1989-5544332-2", person_type: "citizen", kin: "wife",
  }),
  "E15": P({
    id: "E15", unified_id: "E15",
    full_name: "Maryam Ahmed Al Suwaidi", name_eng: "Maryam Ahmed Al Suwaidi", name_arabic: "مريم أحمد السويدي",
    dob: "1991-03-08", date_of_birth: "1991-03-08",
    passport_no: "AE44332211", passport: "AE44332211", contact_no: "+971501345678",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "784-1991-4433221-2", person_type: "citizen", kin: "wife",
  }),
  "E16": P({
    id: "E16", unified_id: "E16",
    full_name: "Yusuf Ahmed Khalid", name_eng: "Yusuf Ahmed Khalid", name_arabic: "يوسف أحمد خالد",
    dob: "2010-07-20", date_of_birth: "2010-07-20",
    passport_no: "AE33221100", passport: "AE33221100", contact_no: "+971501456789",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "784-2010-3322110-1", person_type: "citizen", kin: "son",
  }),
  "E17": P({
    id: "E17", unified_id: "E17",
    full_name: "Hassan Ahmed Khalid", name_eng: "Hassan Ahmed Khalid", name_arabic: "حسن أحمد خالد",
    dob: "2012-11-05", date_of_birth: "2012-11-05",
    passport_no: "AE22110099", passport: "AE22110099", contact_no: "+971501567890",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "784-2012-2211009-1", person_type: "citizen", kin: "son",
  }),
  "E18": P({
    id: "E18", unified_id: "E18",
    full_name: "Amina Ahmed Khalid", name_eng: "Amina Ahmed Khalid", name_arabic: "أمينة أحمد خالد",
    dob: "2014-02-18", date_of_birth: "2014-02-18",
    passport_no: "AE11009988", passport: "AE11009988", contact_no: "+971501678901",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "784-2014-1100998-2", person_type: "citizen", kin: "daughter",
  }),
  "E19": P({
    id: "E19", unified_id: "E19",
    full_name: "Khadija Ahmed Khalid", name_eng: "Khadija Ahmed Khalid", name_arabic: "خديجة أحمد خالد",
    dob: "2016-05-25", date_of_birth: "2016-05-25",
    passport_no: "AE00998877", passport: "AE00998877", contact_no: "+971501789012",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "784-2016-0099887-2", person_type: "citizen", kin: "daughter",
  }),
  "E20": P({
    id: "E20", unified_id: "E20",
    full_name: "Ibrahim Ahmed Khalid", name_eng: "Ibrahim Ahmed Khalid", name_arabic: "إبراهيم أحمد خالد",
    dob: "2018-08-10", date_of_birth: "2018-08-10",
    passport_no: "AE99887700", passport: "AE99887700", contact_no: "+971501800123",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "784-2018-9988770-1", person_type: "citizen", kin: "son",
  }),
  "E21": P({
    id: "E21", unified_id: "E21",
    full_name: "Sara Ahmed Khalid", name_eng: "Sara Ahmed Khalid", name_arabic: "سارة أحمد خالد",
    dob: "2020-10-15", date_of_birth: "2020-10-15",
    passport_no: "AE88776600", passport: "AE88776600", contact_no: "+971501901234",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "784-2020-8877660-2", person_type: "citizen", kin: "daughter",
  }),

  // ════════════════════════════════════════════════════════════════════════
  // Scenario H — Divorced + remarried (kids from each marriage)
  // Root: Mohammed Ali Al Dhaheri  (E22)
  // (Renumbered from Python's E20 to avoid collision with polygamy scenario.)
  // ════════════════════════════════════════════════════════════════════════
  "E22": P({
    id: "E22", unified_id: "E22",
    full_name: "Mohammed Ali Al Dhaheri", name_eng: "Mohammed Ali Al Dhaheri", name_arabic: "محمد علي الظاهري",
    dob: "1988-06-12", date_of_birth: "1988-06-12",
    passport_no: "AE77665522", passport: "AE77665522", contact_no: "+971502012345",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "784-1988-7766550-1", person_type: "citizen", kin: "self",
  }),
  "E23": P({
    id: "E23", unified_id: "E23",
    full_name: "Ali Hassan Al Dhaheri", name_eng: "Ali Hassan Al Dhaheri", name_arabic: "علي حسن الظاهري",
    dob: "1962-09-25", date_of_birth: "1962-09-25",
    passport_no: "AE66554422", passport: "AE66554422", contact_no: "+971502123456",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "784-1962-6655440-1", person_type: "citizen", kin: "father",
  }),
  "E24": P({
    id: "E24", unified_id: "E24",
    full_name: "Noor Ali Al Dhaheri", name_eng: "Noor Ali Al Dhaheri", name_arabic: "نور علي الظاهري",
    dob: "1965-12-08", date_of_birth: "1965-12-08",
    passport_no: "AE55443300", passport: "AE55443300", contact_no: "+971502234567",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "784-1965-5544330-2", person_type: "citizen", kin: "mother",
  }),
  "E25": P({
    id: "E25", unified_id: "E25",
    full_name: "Layla Mohammed Al Dhaheri", name_eng: "Layla Mohammed Al Dhaheri", name_arabic: "ليلى محمد الظاهري",
    dob: "1990-03-20", date_of_birth: "1990-03-20",
    passport_no: "AE44332200", passport: "AE44332200", contact_no: "+971502345678",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "784-1990-4433220-2", person_type: "citizen", kin: "ex-wife",
  }),
  "E26": P({
    id: "E26", unified_id: "E26",
    full_name: "Sana Mohammed Al Dhaheri", name_eng: "Sana Mohammed Al Dhaheri", name_arabic: "سناء محمد الظاهري",
    dob: "1992-07-14", date_of_birth: "1992-07-14",
    passport_no: "AE33221122", passport: "AE33221122", contact_no: "+971502456789",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "784-1992-3322112-2", person_type: "citizen", kin: "wife",
  }),
  "E27": P({
    id: "E27", unified_id: "E27",
    full_name: "Omar Mohammed Ali", name_eng: "Omar Mohammed Ali", name_arabic: "عمر محمد علي",
    dob: "2012-04-30", date_of_birth: "2012-04-30",
    passport_no: "AE22110011", passport: "AE22110011", contact_no: "+971502567890",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "784-2012-2211001-1", person_type: "citizen", kin: "son",
  }),
  "E28": P({
    id: "E28", unified_id: "E28",
    full_name: "Huda Mohammed Ali", name_eng: "Huda Mohammed Ali", name_arabic: "هدى محمد علي",
    dob: "2014-08-15", date_of_birth: "2014-08-15",
    passport_no: "AE11009977", passport: "AE11009977", contact_no: "+971502678901",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "784-2014-1100997-2", person_type: "citizen", kin: "daughter",
  }),
  "E29": P({
    id: "E29", unified_id: "E29",
    full_name: "Khalid Mohammed Ali", name_eng: "Khalid Mohammed Ali", name_arabic: "خالد محمد علي",
    dob: "2018-11-22", date_of_birth: "2018-11-22",
    passport_no: "AE00998866", passport: "AE00998866", contact_no: "+971502789012",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "784-2018-0099886-1", person_type: "citizen", kin: "son",
  }),

  // ════════════════════════════════════════════════════════════════════════
  // Scenario I — Three generations (paternal + maternal grandparents → root → grandchildren)
  // Root: Saeed Omar Al Zaabi  (E30)
  // ════════════════════════════════════════════════════════════════════════
  "E30": P({
    id: "E30", unified_id: "E30",
    full_name: "Saeed Omar Al Zaabi", name_eng: "Saeed Omar Al Zaabi", name_arabic: "سعيد عمر الزعابي",
    dob: "1983-02-10", date_of_birth: "1983-02-10",
    passport_no: "AE11223300", passport: "AE11223300", contact_no: "+971503012345",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "784-1983-1122330-1", person_type: "citizen", kin: "self",
  }),
  "E31": P({
    id: "E31", unified_id: "E31",
    full_name: "Omar Rashid Al Zaabi", name_eng: "Omar Rashid Al Zaabi", name_arabic: "عمر راشد الزعابي",
    dob: "1958-05-20", date_of_birth: "1958-05-20",
    passport_no: "AE22334411", passport: "AE22334411", contact_no: "+971503123456",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "784-1958-2233441-1", person_type: "citizen", kin: "father",
  }),
  "E32": P({
    id: "E32", unified_id: "E32",
    full_name: "Amina Mohammed Al Zaabi", name_eng: "Amina Mohammed Al Zaabi", name_arabic: "أمينة محمد الزعابي",
    dob: "1960-08-15", date_of_birth: "1960-08-15",
    passport_no: "AE33445500", passport: "AE33445500", contact_no: "+971503234567",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "784-1960-3344550-2", person_type: "citizen", kin: "mother",
  }),
  "E33": P({
    id: "E33", unified_id: "E33",
    full_name: "Rashid Saeed Al Zaabi", name_eng: "Rashid Saeed Al Zaabi", name_arabic: "راشد سعيد الزعابي",
    dob: "1935-11-30", date_of_birth: "1935-11-30",
    passport_no: "AE44556600", passport: "AE44556600", contact_no: "+971503345678",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "784-1935-4455660-1", person_type: "citizen", kin: "paternal grandfather",
  }),
  "E34": P({
    id: "E34", unified_id: "E34",
    full_name: "Fatima Rashid Al Zaabi", name_eng: "Fatima Rashid Al Zaabi", name_arabic: "فاطمة راشد الزعابي",
    dob: "1938-04-12", date_of_birth: "1938-04-12",
    passport_no: "AE55667700", passport: "AE55667700", contact_no: "+971503456000",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "784-1938-5566770-2", person_type: "citizen", kin: "paternal grandmother",
  }),
  "E35": P({
    id: "E35", unified_id: "E35",
    full_name: "Mohammed Saif Al Nuaimi", name_eng: "Mohammed Saif Al Nuaimi", name_arabic: "محمد سيف النعيمي",
    dob: "1933-07-25", date_of_birth: "1933-07-25",
    passport_no: "AE66778899", passport: "AE66778899", contact_no: "+971503567890",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "784-1933-6677889-1", person_type: "citizen", kin: "maternal grandfather",
  }),
  "E36": P({
    id: "E36", unified_id: "E36",
    full_name: "Khadija Mohammed Al Nuaimi", name_eng: "Khadija Mohammed Al Nuaimi", name_arabic: "خديجة محمد النعيمي",
    dob: "1936-10-08", date_of_birth: "1936-10-08",
    passport_no: "AE77889900", passport: "AE77889900", contact_no: "+971503678901",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "784-1936-7788990-2", person_type: "citizen", kin: "maternal grandmother",
  }),
  "E37": P({
    id: "E37", unified_id: "E37",
    full_name: "Noor Saeed Al Zaabi", name_eng: "Noor Saeed Al Zaabi", name_arabic: "نور سعيد الزعابي",
    dob: "1985-01-18", date_of_birth: "1985-01-18",
    passport_no: "AE88990011", passport: "AE88990011", contact_no: "+971503789012",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "784-1985-8899001-2", person_type: "citizen", kin: "wife",
  }),
  "E38": P({
    id: "E38", unified_id: "E38",
    full_name: "Yusuf Saeed Omar", name_eng: "Yusuf Saeed Omar", name_arabic: "يوسف سعيد عمر",
    dob: "2008-06-22", date_of_birth: "2008-06-22",
    passport_no: "AE99001122", passport: "AE99001122", contact_no: "+971503890123",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "784-2008-9900112-1", person_type: "citizen", kin: "son",
  }),
  "E39": P({
    id: "E39", unified_id: "E39",
    full_name: "Layla Saeed Omar", name_eng: "Layla Saeed Omar", name_arabic: "ليلى سعيد عمر",
    dob: "2010-09-14", date_of_birth: "2010-09-14",
    passport_no: "AE00112233", passport: "AE00112233", contact_no: "+971503901234",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "784-2010-0011223-2", person_type: "citizen", kin: "daughter",
  }),
  "E40": P({
    id: "E40", unified_id: "E40",
    full_name: "Ahmed Yusuf Saeed", name_eng: "Ahmed Yusuf Saeed", name_arabic: "أحمد يوسف سعيد",
    dob: "2025-03-05", date_of_birth: "2025-03-05",
    passport_no: "AE11223355", passport: "AE11223355",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "784-2025-1122335-1", person_type: "citizen", kin: "grandson",
  }),
  "E41": P({
    id: "E41", unified_id: "E41",
    full_name: "Mariam Yusuf Saeed", name_eng: "Mariam Yusuf Saeed", name_arabic: "مريم يوسف سعيد",
    dob: "2027-07-20", date_of_birth: "2027-07-20",
    passport_no: "AE22334466", passport: "AE22334466",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "784-2027-2233446-2", person_type: "citizen", kin: "granddaughter",
  }),
  "E42": P({
    id: "E42", unified_id: "E42",
    full_name: "Hassan Saeed Omar", name_eng: "Hassan Saeed Omar", name_arabic: "حسن سعيد عمر",
    dob: "1985-12-03", date_of_birth: "1985-12-03",
    passport_no: "AE33445577", passport: "AE33445577", contact_no: "+971504234567",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "784-1985-3344557-1", person_type: "citizen", kin: "brother",
  }),

  // ════════════════════════════════════════════════════════════════════════
  // Scenario J — Resident family (non-citizen, no national_id)
  // Root: John Smith  (E43)
  // (Renumbered from Python's E40 to avoid collision with multi-gen scenario.)
  // ════════════════════════════════════════════════════════════════════════
  "E43": P({
    id: "E43", unified_id: "E43",
    full_name: "John Smith", name_eng: "John Smith", name_arabic: "جون سميث",
    dob: "1985-03-15", date_of_birth: "1985-03-15",
    passport_no: "US12345678", passport: "US12345678", contact_no: "+971504345678",
    nationality: "USA", gender: "M", sex: "M",
    person_type: "resident", kin: "self",
  }),
  "E44": P({
    id: "E44", unified_id: "E44",
    full_name: "Sarah Smith", name_eng: "Sarah Smith", name_arabic: "سارة سميث",
    dob: "1987-07-22", date_of_birth: "1987-07-22",
    passport_no: "US87654321", passport: "US87654321", contact_no: "+971504456789",
    nationality: "USA", gender: "F", sex: "F",
    person_type: "resident", kin: "wife",
  }),
  "E45": P({
    id: "E45", unified_id: "E45",
    full_name: "Emma Smith", name_eng: "Emma Smith", name_arabic: "إيما سميث",
    dob: "2012-11-08", date_of_birth: "2012-11-08",
    passport_no: "US11223344", passport: "US11223344", contact_no: "+971504567890",
    nationality: "USA", gender: "F", sex: "F",
    person_type: "resident", kin: "daughter",
  }),
  "E46": P({
    id: "E46", unified_id: "E46",
    full_name: "James Smith", name_eng: "James Smith", name_arabic: "جيمس سميث",
    dob: "2015-04-30", date_of_birth: "2015-04-30",
    passport_no: "US22334455", passport: "US22334455", contact_no: "+971504678901",
    nationality: "USA", gender: "M", sex: "M",
    person_type: "resident", kin: "son",
  }),

  // ════════════════════════════════════════════════════════════════════════
  // Scenario K — Single parent (no spouse modeled, two children)
  // Root: Khalid Ahmed Al Mansoori  (E50)
  // ════════════════════════════════════════════════════════════════════════
  "E50": P({
    id: "E50", unified_id: "E50",
    full_name: "Khalid Ahmed Al Mansoori", name_eng: "Khalid Ahmed Al Mansoori", name_arabic: "خالد أحمد المنصوري",
    dob: "1995-10-05", date_of_birth: "1995-10-05",
    passport_no: "AE99887755", passport: "AE99887755", contact_no: "+971505012345",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "784-1995-9988775-1", person_type: "citizen", kin: "self",
  }),
  "E51": P({
    id: "E51", unified_id: "E51",
    full_name: "Ahmed Salim Al Mansoori", name_eng: "Ahmed Salim Al Mansoori", name_arabic: "أحمد سالم المنصوري",
    dob: "1970-12-18", date_of_birth: "1970-12-18",
    passport_no: "AE88776644", passport: "AE88776644", contact_no: "+971505123456",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "784-1970-8877664-1", person_type: "citizen", kin: "father",
  }),
  "E52": P({
    id: "E52", unified_id: "E52",
    full_name: "Fatima Ahmed Al Mansoori", name_eng: "Fatima Ahmed Al Mansoori", name_arabic: "فاطمة أحمد المنصوري",
    dob: "1973-05-25", date_of_birth: "1973-05-25",
    passport_no: "AE77665533", passport: "AE77665533", contact_no: "+971505234567",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "784-1973-7766553-2", person_type: "citizen", kin: "mother",
  }),
  "E53": P({
    id: "E53", unified_id: "E53",
    full_name: "Omar Khalid Ahmed", name_eng: "Omar Khalid Ahmed", name_arabic: "عمر خالد أحمد",
    dob: "2020-08-12", date_of_birth: "2020-08-12",
    passport_no: "AE66554411", passport: "AE66554411",
    nationality: "UAE", gender: "M", sex: "M",
    national_id: "784-2020-6655441-1", person_type: "citizen", kin: "son",
  }),
  "E54": P({
    id: "E54", unified_id: "E54",
    full_name: "Layla Khalid Ahmed", name_eng: "Layla Khalid Ahmed", name_arabic: "ليلى خالد أحمد",
    dob: "2022-01-20", date_of_birth: "2022-01-20",
    passport_no: "AE55443311", passport: "AE55443311",
    nationality: "UAE", gender: "F", sex: "F",
    national_id: "784-2022-5544331-2", person_type: "citizen", kin: "daughter",
  }),
};

export const EID_MAP = {
  "784-1985-1234567-1": "P0020375801",
  "784198512345671":    "P0020375801",
  "784-1978-2222333-1": "P0050000001",  // Salem (divorced + remarried)
  "784-1972-3334444-1": "P0060000001",  // Jamila (widow)
  "784-1968-4445555-1": "P0070000001",  // Rashid (3 marriages)
  "784-1985-5556666-1": "P0080000001",  // Aisha (single mother)
  "784-1980-6667777-1": "P0090000001",  // Faisal (childless couple)
  // E-series scenario roots
  "784-1990-1234567-1": "E1",   // Basic family (Ali Hassan)
  "784-1985-9988776-1": "E10",  // Polygamy (Ahmed Khalid, 3 wives)
  "784-1988-7766550-1": "E22",  // Divorced + remarried (Mohammed Ali)
  "784-1983-1122330-1": "E30",  // Three generations (Saeed Omar)
  "784-1995-9988775-1": "E50",  // Single parent (Khalid Ahmed)
};

export const PASSPORT_MAP = {
  "PA22710627":  "P0020375801",
  "XB99887766":  "P0099887766",
  "PA10000010":  "P0010000010",
  "PA50000001":  "P0050000001",
  "PA60000001":  "P0060000001",
  "PA70000001":  "P0070000001",
  "PA80000001":  "P0080000001",
  "PA90000001":  "P0090000001",
  // E-series scenario roots
  "AE12345678":  "E1",   // Basic family (Ali Hassan)
  "AE99887766":  "E10",  // Polygamy (Ahmed Khalid)
  "AE77665522":  "E22",  // Divorced + remarried (Mohammed Ali)
  "AE11223300":  "E30",  // Three generations (Saeed Omar)
  "US12345678":  "E43",  // Resident (John Smith)
  "AE99887755":  "E50",  // Single parent (Khalid Ahmed)
};

// ── Tree definitions ─────────────────────────────────────────────────────────

export function buildTree(rootId) {
  // Ahmed Al Mansouri — full deep tree
  if (rootId === "P0020375801") {
    const nodeIds = [
      "P0000000900", "P0000000901",                         // great-grandparents (paternal-paternal)
      "P0000000001", "P0000000002",                         // paternal grandparents
      "P0000000003", "P0000000004",                         // maternal grandparents
      "P0010000020", "P0010000021", "P0010000022",          // paternal aunts/uncles
      "P0010000010", "P0010000011",                         // parents
      "P0010000030", "P0010000031",                         // maternal aunts/uncles
      "P0020375803", "P0020375804", "P0020375805",          // siblings
      "P0020375801",                                        // root
      "P0020375802", "P0020375810",                         // wives
      "P0030000100", "P0030000101", "P0030000103",          // children w/ Mariam
      "P0030000102", "P0030000104",                         // children w/ Noura
      "P0040000200", "P0040000201",                         // grandchildren via Khalid
      "P0040000202", "P0040000203",                         // grandchildren via Sara
      "P0040000204",                                        // grandchild via Mansour
      "P0040000205", "P0040000206",                         // grandchildren via Zayed
    ];
    const nodes = nodeIds.map((id) => MOCK_PEOPLE[id]).filter(Boolean);
    const edges = [
      // Great-grandparents → paternal grandfather
      { source: "P0000000001", target: "P0000000900", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0000000001", target: "P0000000901", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0000000900", target: "P0000000901", type: "SPOUSE_OF", relationship_status: "active" },

      // Grandparents ↔ marriages
      { source: "P0000000001", target: "P0000000002", type: "SPOUSE_OF", relationship_status: "active" },
      { source: "P0000000003", target: "P0000000004", type: "SPOUSE_OF", relationship_status: "active" },

      // Paternal grandparents → father + paternal aunts/uncles
      { source: "P0010000010", target: "P0000000001", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0010000010", target: "P0000000002", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0010000020", target: "P0000000001", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0010000020", target: "P0000000002", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0010000021", target: "P0000000001", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0010000021", target: "P0000000002", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0010000022", target: "P0000000001", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0010000022", target: "P0000000002", type: "CHILD_OF", parent_sex: "F" },

      // Maternal grandparents → mother + maternal aunts/uncles
      { source: "P0010000011", target: "P0000000003", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0010000011", target: "P0000000004", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0010000030", target: "P0000000003", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0010000030", target: "P0000000004", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0010000031", target: "P0000000003", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0010000031", target: "P0000000004", type: "CHILD_OF", parent_sex: "F" },

      // Parents ↔ spouse
      { source: "P0010000010", target: "P0010000011", type: "SPOUSE_OF", relationship_status: "active" },

      // Root + siblings ← parents
      { source: "P0020375801", target: "P0010000010", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0020375801", target: "P0010000011", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0020375803", target: "P0010000010", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0020375803", target: "P0010000011", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0020375804", target: "P0010000010", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0020375804", target: "P0010000011", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0020375805", target: "P0010000010", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0020375805", target: "P0010000011", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0020375801", target: "P0020375803", type: "SIBLING_OF" },
      { source: "P0020375801", target: "P0020375804", type: "SIBLING_OF" },
      { source: "P0020375801", target: "P0020375805", type: "SIBLING_OF" },

      // Root ↔ wives
      { source: "P0020375801", target: "P0020375802", type: "SPOUSE_OF", relationship_status: "active" },
      { source: "P0020375801", target: "P0020375810", type: "SPOUSE_OF", relationship_status: "active" },

      // Children with Mariam
      { source: "P0030000100", target: "P0020375801", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0030000100", target: "P0020375802", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0030000101", target: "P0020375801", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0030000101", target: "P0020375802", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0030000103", target: "P0020375801", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0030000103", target: "P0020375802", type: "CHILD_OF", parent_sex: "F" },

      // Children with Noura
      { source: "P0030000102", target: "P0020375801", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0030000102", target: "P0020375810", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0030000104", target: "P0020375801", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0030000104", target: "P0020375810", type: "CHILD_OF", parent_sex: "F" },

      // Sibling links among full-siblings within each motherhood
      { source: "P0030000100", target: "P0030000101", type: "SIBLING_OF" },
      { source: "P0030000100", target: "P0030000103", type: "SIBLING_OF" },
      { source: "P0030000101", target: "P0030000103", type: "SIBLING_OF" },
      { source: "P0030000102", target: "P0030000104", type: "SIBLING_OF" },

      // Grandchildren
      { source: "P0040000200", target: "P0030000100", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0040000201", target: "P0030000100", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0040000202", target: "P0030000101", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0040000203", target: "P0030000101", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0040000204", target: "P0030000103", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0040000205", target: "P0030000102", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0040000206", target: "P0030000102", type: "CHILD_OF", parent_sex: "M" },
    ];
    return { root: rootId, nodes, edges };
  }

  // Father (Hassan) — subset showing his parents, wife, kids, his own siblings
  if (rootId === "P0010000010") {
    const nodeIds = [
      "P0000000001", "P0000000002",
      "P0010000020", "P0010000021", "P0010000022",
      "P0010000010", "P0010000011",
      "P0020375801", "P0020375803", "P0020375804", "P0020375805",
    ];
    const nodes = nodeIds.map((id) => MOCK_PEOPLE[id]).filter(Boolean);
    const edges = [
      { source: "P0010000010", target: "P0000000001", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0010000010", target: "P0000000002", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0010000020", target: "P0000000001", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0010000020", target: "P0000000002", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0010000021", target: "P0000000001", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0010000021", target: "P0000000002", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0010000022", target: "P0000000001", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0010000022", target: "P0000000002", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0010000010", target: "P0010000011", type: "SPOUSE_OF", relationship_status: "active" },
      { source: "P0020375801", target: "P0010000010", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0020375801", target: "P0010000011", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0020375803", target: "P0010000010", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0020375803", target: "P0010000011", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0020375804", target: "P0010000010", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0020375804", target: "P0010000011", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0020375805", target: "P0010000010", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0020375805", target: "P0010000011", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0020375801", target: "P0020375803", type: "SIBLING_OF" },
      { source: "P0020375801", target: "P0020375804", type: "SIBLING_OF" },
      { source: "P0020375801", target: "P0020375805", type: "SIBLING_OF" },
    ];
    return { root: rootId, nodes, edges };
  }

  // Khalid Al Rashidi (resident demo)
  if (rootId === "P0099887766") {
    const nodeIds = ["P0099887766", "P0099887767", "P0099887768", "P0099887769"];
    const nodes = nodeIds.map((id) => MOCK_PEOPLE[id]).filter(Boolean);
    const edges = [
      { source: "P0099887766", target: "P0099887767", type: "SPOUSE_OF", relationship_status: "active" },
      { source: "P0099887768", target: "P0099887766", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0099887768", target: "P0099887767", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0099887769", target: "P0099887766", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0099887769", target: "P0099887767", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0099887768", target: "P0099887769", type: "SIBLING_OF" },
    ];
    return { root: rootId, nodes, edges };
  }

  // Khalid (son of Ahmed) — shows him with parents, siblings, and his own grandchildren-tier
  if (rootId === "P0030000100") {
    const nodeIds = [
      "P0020375801", "P0020375802",
      "P0030000100", "P0030000101", "P0030000103",
      "P0040000200", "P0040000201",
    ];
    const nodes = nodeIds.map((id) => MOCK_PEOPLE[id]).filter(Boolean);
    const edges = [
      { source: "P0020375801", target: "P0020375802", type: "SPOUSE_OF", relationship_status: "active" },
      { source: "P0030000100", target: "P0020375801", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0030000100", target: "P0020375802", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0030000101", target: "P0020375801", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0030000101", target: "P0020375802", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0030000103", target: "P0020375801", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0030000103", target: "P0020375802", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0030000100", target: "P0030000101", type: "SIBLING_OF" },
      { source: "P0030000100", target: "P0030000103", type: "SIBLING_OF" },
      { source: "P0040000200", target: "P0030000100", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0040000201", target: "P0030000100", type: "CHILD_OF", parent_sex: "M" },
    ];
    return { root: rootId, nodes, edges };
  }

  // ── Scenario A — Salem: divorced + remarried (half-siblings) ─────────────
  if (rootId === "P0050000001") {
    const nodeIds = [
      "P0050000050", "P0050000051",                                       // parents
      "P0050000010", "P0050000001", "P0050000011",                        // ex-wife | root | wife
      "P0050000020", "P0050000021", "P0050000022",                        // children w/ Hessa
      "P0050000023", "P0050000024",                                       // children w/ Mona
    ];
    const nodes = nodeIds.map((id) => MOCK_PEOPLE[id]).filter(Boolean);
    const edges = [
      // Parents
      { source: "P0050000050", target: "P0050000051", type: "SPOUSE_OF", relationship_status: "active" },
      { source: "P0050000001", target: "P0050000050", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0050000001", target: "P0050000051", type: "CHILD_OF", parent_sex: "F" },
      // Marriages: ex-wife (inactive) + current wife (active)
      { source: "P0050000001", target: "P0050000010", type: "SPOUSE_OF", relationship_status: "inactive" },
      { source: "P0050000001", target: "P0050000011", type: "SPOUSE_OF", relationship_status: "active" },
      // Children with Hessa (ex-wife)
      { source: "P0050000020", target: "P0050000001", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0050000020", target: "P0050000010", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0050000021", target: "P0050000001", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0050000021", target: "P0050000010", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0050000022", target: "P0050000001", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0050000022", target: "P0050000010", type: "CHILD_OF", parent_sex: "F" },
      // Children with Mona (current wife) — half-siblings to the above
      { source: "P0050000023", target: "P0050000001", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0050000023", target: "P0050000011", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0050000024", target: "P0050000001", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0050000024", target: "P0050000011", type: "CHILD_OF", parent_sex: "F" },
      // Full siblings within each motherhood
      { source: "P0050000020", target: "P0050000021", type: "SIBLING_OF" },
      { source: "P0050000020", target: "P0050000022", type: "SIBLING_OF" },
      { source: "P0050000021", target: "P0050000022", type: "SIBLING_OF" },
      { source: "P0050000023", target: "P0050000024", type: "SIBLING_OF" },
      // (Half-sibling edges across the two groups are auto-detected by the layout)
    ];
    return { root: rootId, nodes, edges };
  }

  // ── Scenario B — Jamila: widow with four children ────────────────────────
  if (rootId === "P0060000001") {
    const nodeIds = [
      "P0060000050", "P0060000051",                                       // parents
      "P0060000010", "P0060000001",                                       // late husband | root
      "P0060000020", "P0060000021", "P0060000022", "P0060000023",         // four children
    ];
    const nodes = nodeIds.map((id) => MOCK_PEOPLE[id]).filter(Boolean);
    const edges = [
      { source: "P0060000050", target: "P0060000051", type: "SPOUSE_OF", relationship_status: "active" },
      { source: "P0060000001", target: "P0060000050", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0060000001", target: "P0060000051", type: "CHILD_OF", parent_sex: "F" },
      // Marriage marked inactive because husband is deceased
      { source: "P0060000001", target: "P0060000010", type: "SPOUSE_OF", relationship_status: "inactive" },
      // Four children (full siblings) — both parents shared
      { source: "P0060000020", target: "P0060000010", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0060000020", target: "P0060000001", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0060000021", target: "P0060000010", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0060000021", target: "P0060000001", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0060000022", target: "P0060000010", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0060000022", target: "P0060000001", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0060000023", target: "P0060000010", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0060000023", target: "P0060000001", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0060000020", target: "P0060000021", type: "SIBLING_OF" },
      { source: "P0060000020", target: "P0060000022", type: "SIBLING_OF" },
      { source: "P0060000020", target: "P0060000023", type: "SIBLING_OF" },
      { source: "P0060000021", target: "P0060000022", type: "SIBLING_OF" },
      { source: "P0060000021", target: "P0060000023", type: "SIBLING_OF" },
      { source: "P0060000022", target: "P0060000023", type: "SIBLING_OF" },
    ];
    return { root: rootId, nodes, edges };
  }

  // ── Scenario C — Rashid: ex-wife + late wife + current wife ──────────────
  if (rootId === "P0070000001") {
    const nodeIds = [
      "P0070000050", "P0070000051",                                       // parents
      "P0070000010", "P0070000011", "P0070000001", "P0070000012",         // ex | late | root | current
      "P0070000020", "P0070000021",                                       // kids w/ Najla (ex)
      "P0070000022",                                                      // kid w/ Wadeema (late)
      "P0070000023", "P0070000024",                                       // kids w/ Amna (current)
    ];
    const nodes = nodeIds.map((id) => MOCK_PEOPLE[id]).filter(Boolean);
    const edges = [
      // Parents
      { source: "P0070000050", target: "P0070000051", type: "SPOUSE_OF", relationship_status: "active" },
      { source: "P0070000001", target: "P0070000050", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0070000001", target: "P0070000051", type: "CHILD_OF", parent_sex: "F" },
      // Three marriages: ex, late (both inactive), current (active)
      { source: "P0070000001", target: "P0070000010", type: "SPOUSE_OF", relationship_status: "inactive" },
      { source: "P0070000001", target: "P0070000011", type: "SPOUSE_OF", relationship_status: "inactive" },
      { source: "P0070000001", target: "P0070000012", type: "SPOUSE_OF", relationship_status: "active" },
      // Kids w/ Najla
      { source: "P0070000020", target: "P0070000001", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0070000020", target: "P0070000010", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0070000021", target: "P0070000001", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0070000021", target: "P0070000010", type: "CHILD_OF", parent_sex: "F" },
      // Kid w/ Wadeema
      { source: "P0070000022", target: "P0070000001", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0070000022", target: "P0070000011", type: "CHILD_OF", parent_sex: "F" },
      // Kids w/ Amna
      { source: "P0070000023", target: "P0070000001", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0070000023", target: "P0070000012", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0070000024", target: "P0070000001", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0070000024", target: "P0070000012", type: "CHILD_OF", parent_sex: "F" },
      // Full siblings within each motherhood
      { source: "P0070000020", target: "P0070000021", type: "SIBLING_OF" },
      { source: "P0070000023", target: "P0070000024", type: "SIBLING_OF" },
    ];
    return { root: rootId, nodes, edges };
  }

  // ── Scenario D — Aisha: single mother (no spouse) ────────────────────────
  if (rootId === "P0080000001") {
    const nodeIds = [
      "P0080000050", "P0080000051",                                       // parents
      "P0080000001",                                                      // root
      "P0080000020", "P0080000021",                                       // children
    ];
    const nodes = nodeIds.map((id) => MOCK_PEOPLE[id]).filter(Boolean);
    const edges = [
      { source: "P0080000050", target: "P0080000051", type: "SPOUSE_OF", relationship_status: "active" },
      { source: "P0080000001", target: "P0080000050", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0080000001", target: "P0080000051", type: "CHILD_OF", parent_sex: "F" },
      // Children — only the root is listed as a parent (no spouse modeled)
      { source: "P0080000020", target: "P0080000001", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0080000021", target: "P0080000001", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0080000020", target: "P0080000021", type: "SIBLING_OF" },
    ];
    return { root: rootId, nodes, edges };
  }

  // ── Scenario E — Faisal: childless couple, with siblings on the side ─────
  if (rootId === "P0090000001") {
    const nodeIds = [
      "P0090000050", "P0090000051",                                       // parents
      "P0090000030", "P0090000001", "P0090000010", "P0090000031",         // brother | root | wife | sister
    ];
    const nodes = nodeIds.map((id) => MOCK_PEOPLE[id]).filter(Boolean);
    const edges = [
      { source: "P0090000050", target: "P0090000051", type: "SPOUSE_OF", relationship_status: "active" },
      // Root + siblings ← parents
      { source: "P0090000001", target: "P0090000050", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0090000001", target: "P0090000051", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0090000030", target: "P0090000050", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0090000030", target: "P0090000051", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0090000031", target: "P0090000050", type: "CHILD_OF", parent_sex: "M" },
      { source: "P0090000031", target: "P0090000051", type: "CHILD_OF", parent_sex: "F" },
      { source: "P0090000001", target: "P0090000030", type: "SIBLING_OF" },
      { source: "P0090000001", target: "P0090000031", type: "SIBLING_OF" },
      // Marriage, no children
      { source: "P0090000001", target: "P0090000010", type: "SPOUSE_OF", relationship_status: "active" },
    ];
    return { root: rootId, nodes, edges };
  }

  // ── E1 — Basic family: single wife, 2 children, 1 sibling ────────────────
  if (rootId === "E1") {
    const nodeIds = ["E2", "E3", "E1", "E4", "E7", "E5", "E6"];
    const nodes = nodeIds.map((id) => MOCK_PEOPLE[id]).filter(Boolean);
    const edges = [
      // Parents
      { source: "E2", target: "E3", type: "SPOUSE_OF", relationship_status: "active" },
      // Root + sister ← parents
      { source: "E1", target: "E2", type: "CHILD_OF", parent_sex: "M" },
      { source: "E1", target: "E3", type: "CHILD_OF", parent_sex: "F" },
      { source: "E7", target: "E2", type: "CHILD_OF", parent_sex: "M" },
      { source: "E7", target: "E3", type: "CHILD_OF", parent_sex: "F" },
      { source: "E1", target: "E7", type: "SIBLING_OF" },
      // Root marriage + children
      { source: "E1", target: "E4", type: "SPOUSE_OF", relationship_status: "active" },
      { source: "E5", target: "E1", type: "CHILD_OF", parent_sex: "M" },
      { source: "E5", target: "E4", type: "CHILD_OF", parent_sex: "F" },
      { source: "E6", target: "E1", type: "CHILD_OF", parent_sex: "M" },
      { source: "E6", target: "E4", type: "CHILD_OF", parent_sex: "F" },
      { source: "E5", target: "E6", type: "SIBLING_OF" },
    ];
    return { root: rootId, nodes, edges };
  }

  // ── E10 — Polygamy: 3 concurrent wives, 6 kids ───────────────────────────
  if (rootId === "E10") {
    const nodeIds = [
      "E11", "E12",                                   // parents
      "E13", "E14", "E15", "E10",                     // wives + root
      "E16", "E17", "E18", "E19", "E20", "E21",       // children
    ];
    const nodes = nodeIds.map((id) => MOCK_PEOPLE[id]).filter(Boolean);
    const edges = [
      { source: "E11", target: "E12", type: "SPOUSE_OF", relationship_status: "active" },
      { source: "E10", target: "E11", type: "CHILD_OF", parent_sex: "M" },
      { source: "E10", target: "E12", type: "CHILD_OF", parent_sex: "F" },
      // Three concurrent marriages
      { source: "E10", target: "E13", type: "SPOUSE_OF", relationship_status: "active" },
      { source: "E10", target: "E14", type: "SPOUSE_OF", relationship_status: "active" },
      { source: "E10", target: "E15", type: "SPOUSE_OF", relationship_status: "active" },
      // Children w/ Fatima (E13)
      { source: "E16", target: "E10", type: "CHILD_OF", parent_sex: "M" },
      { source: "E16", target: "E13", type: "CHILD_OF", parent_sex: "F" },
      { source: "E17", target: "E10", type: "CHILD_OF", parent_sex: "M" },
      { source: "E17", target: "E13", type: "CHILD_OF", parent_sex: "F" },
      // Children w/ Zainab (E14)
      { source: "E18", target: "E10", type: "CHILD_OF", parent_sex: "M" },
      { source: "E18", target: "E14", type: "CHILD_OF", parent_sex: "F" },
      { source: "E19", target: "E10", type: "CHILD_OF", parent_sex: "M" },
      { source: "E19", target: "E14", type: "CHILD_OF", parent_sex: "F" },
      // Children w/ Maryam (E15)
      { source: "E20", target: "E10", type: "CHILD_OF", parent_sex: "M" },
      { source: "E20", target: "E15", type: "CHILD_OF", parent_sex: "F" },
      { source: "E21", target: "E10", type: "CHILD_OF", parent_sex: "M" },
      { source: "E21", target: "E15", type: "CHILD_OF", parent_sex: "F" },
      // Full siblings within each motherhood
      { source: "E16", target: "E17", type: "SIBLING_OF" },
      { source: "E18", target: "E19", type: "SIBLING_OF" },
      { source: "E20", target: "E21", type: "SIBLING_OF" },
    ];
    return { root: rootId, nodes, edges };
  }

  // ── E22 — Divorced + remarried (kids from each marriage) ─────────────────
  if (rootId === "E22") {
    const nodeIds = [
      "E23", "E24",                                   // parents
      "E25", "E22", "E26",                            // ex-wife | root | wife
      "E27", "E28",                                   // kids w/ Layla (ex)
      "E29",                                          // kid w/ Sana (current)
    ];
    const nodes = nodeIds.map((id) => MOCK_PEOPLE[id]).filter(Boolean);
    const edges = [
      { source: "E23", target: "E24", type: "SPOUSE_OF", relationship_status: "active" },
      { source: "E22", target: "E23", type: "CHILD_OF", parent_sex: "M" },
      { source: "E22", target: "E24", type: "CHILD_OF", parent_sex: "F" },
      // Two marriages: Layla (divorced/inactive), Sana (current/active)
      { source: "E22", target: "E25", type: "SPOUSE_OF", relationship_status: "inactive" },
      { source: "E22", target: "E26", type: "SPOUSE_OF", relationship_status: "active" },
      // Children w/ Layla (ex-wife)
      { source: "E27", target: "E22", type: "CHILD_OF", parent_sex: "M" },
      { source: "E27", target: "E25", type: "CHILD_OF", parent_sex: "F" },
      { source: "E28", target: "E22", type: "CHILD_OF", parent_sex: "M" },
      { source: "E28", target: "E25", type: "CHILD_OF", parent_sex: "F" },
      // Child w/ Sana (current)
      { source: "E29", target: "E22", type: "CHILD_OF", parent_sex: "M" },
      { source: "E29", target: "E26", type: "CHILD_OF", parent_sex: "F" },
      // Full siblings within each motherhood
      { source: "E27", target: "E28", type: "SIBLING_OF" },
    ];
    return { root: rootId, nodes, edges };
  }

  // ── E30 — Three generations: grandparents → root → grandchildren ─────────
  if (rootId === "E30") {
    const nodeIds = [
      "E33", "E34", "E35", "E36",                     // grandparents (paternal + maternal)
      "E31", "E32",                                   // parents
      "E30", "E37", "E42",                            // root | wife | brother
      "E38", "E39",                                   // children
      "E40", "E41",                                   // grandchildren via E38
    ];
    const nodes = nodeIds.map((id) => MOCK_PEOPLE[id]).filter(Boolean);
    const edges = [
      // Grandparent marriages
      { source: "E33", target: "E34", type: "SPOUSE_OF", relationship_status: "active" },
      { source: "E35", target: "E36", type: "SPOUSE_OF", relationship_status: "active" },
      // Parents ← grandparents
      { source: "E31", target: "E33", type: "CHILD_OF", parent_sex: "M" },
      { source: "E31", target: "E34", type: "CHILD_OF", parent_sex: "F" },
      { source: "E32", target: "E35", type: "CHILD_OF", parent_sex: "M" },
      { source: "E32", target: "E36", type: "CHILD_OF", parent_sex: "F" },
      // Parent marriage
      { source: "E31", target: "E32", type: "SPOUSE_OF", relationship_status: "active" },
      // Root + brother ← parents
      { source: "E30", target: "E31", type: "CHILD_OF", parent_sex: "M" },
      { source: "E30", target: "E32", type: "CHILD_OF", parent_sex: "F" },
      { source: "E42", target: "E31", type: "CHILD_OF", parent_sex: "M" },
      { source: "E42", target: "E32", type: "CHILD_OF", parent_sex: "F" },
      { source: "E30", target: "E42", type: "SIBLING_OF" },
      // Root marriage
      { source: "E30", target: "E37", type: "SPOUSE_OF", relationship_status: "active" },
      // Children
      { source: "E38", target: "E30", type: "CHILD_OF", parent_sex: "M" },
      { source: "E38", target: "E37", type: "CHILD_OF", parent_sex: "F" },
      { source: "E39", target: "E30", type: "CHILD_OF", parent_sex: "M" },
      { source: "E39", target: "E37", type: "CHILD_OF", parent_sex: "F" },
      { source: "E38", target: "E39", type: "SIBLING_OF" },
      // Grandchildren via E38 (mother not modeled)
      { source: "E40", target: "E38", type: "CHILD_OF", parent_sex: "M" },
      { source: "E41", target: "E38", type: "CHILD_OF", parent_sex: "M" },
      { source: "E40", target: "E41", type: "SIBLING_OF" },
    ];
    return { root: rootId, nodes, edges };
  }

  // ── E43 — Resident family (non-citizen, no national_id) ──────────────────
  if (rootId === "E43") {
    const nodeIds = ["E43", "E44", "E45", "E46"];
    const nodes = nodeIds.map((id) => MOCK_PEOPLE[id]).filter(Boolean);
    const edges = [
      { source: "E43", target: "E44", type: "SPOUSE_OF", relationship_status: "active" },
      { source: "E45", target: "E43", type: "CHILD_OF", parent_sex: "M" },
      { source: "E45", target: "E44", type: "CHILD_OF", parent_sex: "F" },
      { source: "E46", target: "E43", type: "CHILD_OF", parent_sex: "M" },
      { source: "E46", target: "E44", type: "CHILD_OF", parent_sex: "F" },
      { source: "E45", target: "E46", type: "SIBLING_OF" },
    ];
    return { root: rootId, nodes, edges };
  }

  // ── E50 — Single parent (no spouse modeled) ──────────────────────────────
  if (rootId === "E50") {
    const nodeIds = ["E51", "E52", "E50", "E53", "E54"];
    const nodes = nodeIds.map((id) => MOCK_PEOPLE[id]).filter(Boolean);
    const edges = [
      { source: "E51", target: "E52", type: "SPOUSE_OF", relationship_status: "active" },
      { source: "E50", target: "E51", type: "CHILD_OF", parent_sex: "M" },
      { source: "E50", target: "E52", type: "CHILD_OF", parent_sex: "F" },
      // Children listed with father (E50, male) only — no spouse modeled
      { source: "E53", target: "E50", type: "CHILD_OF", parent_sex: "M" },
      { source: "E54", target: "E50", type: "CHILD_OF", parent_sex: "M" },
      { source: "E53", target: "E54", type: "SIBLING_OF" },
    ];
    return { root: rootId, nodes, edges };
  }

  // Fallback
  const person = MOCK_PEOPLE[rootId];
  if (person) return { root: rootId, nodes: [person], edges: [] };
  return null;
}
