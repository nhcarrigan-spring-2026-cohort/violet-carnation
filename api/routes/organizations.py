#
# Get organizations endpoint
# 

"""
@app.get("/orgs/")
async def read_orgs(
    session: SessionDep,
    offset: int=0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> list[Organizations]:
    orgs = session.exec( select(Organizations).offset(offset).limit(limit)).all()
    return orgs
 """