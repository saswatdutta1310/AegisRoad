from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/contractors", tags=["contractors"])

CONTRACTORS = [
    {"id":1,"name":"Ramesh Road Works","district":"Vijayawada","score":87,"avg_days":1.8,"budget":48,"spent":41,"active_sla":1},
    {"id":2,"name":"AP Infrastructure Ltd","district":"Guntur","score":72,"avg_days":3.2,"budget":62,"spent":58,"active_sla":2},
    {"id":3,"name":"National Highway Corp","district":"Mangalagiri","score":91,"avg_days":1.1,"budget":120,"spent":98,"active_sla":1},
    {"id":4,"name":"Coastal Road Builders","district":"Krishna","score":55,"avg_days":5.6,"budget":35,"spent":34,"active_sla":3},
    {"id":5,"name":"Deccan Infra Pvt Ltd","district":"Prakasam","score":63,"avg_days":4.1,"budget":55,"spent":52,"active_sla":3},
]

@router.get("/")
def list_contractors():
    return {"contractors": sorted(CONTRACTORS, key=lambda x: -x["score"])}

@router.get("/{cid}")
def get_contractor(cid: int):
    c = next((x for x in CONTRACTORS if x["id"] == cid), None)
    if not c: raise HTTPException(404, "Not found")
    return c
