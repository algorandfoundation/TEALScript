import algosdk from "algosdk";
import * as bkr from "beaker-ts";
export class AbiTest extends bkr.ApplicationClient {
    desc: string = "";
    override appSchema: bkr.Schema = { declared: { gRef: { type: bkr.AVMType.bytes, key: "gRef", desc: "", static: false }, gMap: { type: bkr.AVMType.bytes, key: "gMap", desc: "", static: false } }, reserved: {} };
    override acctSchema: bkr.Schema = { declared: { lRef: { type: bkr.AVMType.bytes, key: "lRef", desc: "", static: false }, lMap: { type: bkr.AVMType.bytes, key: "lMap", desc: "", static: false } }, reserved: {} };
    override approvalProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKCWIgbWFpbgoKYmFyZV9yb3V0ZV9jcmVhdGU6CglieXRlIDB4CglkdXBuIDEKCWNhbGxzdWIgY3JlYXRlCglpbnQgMQoJcmV0dXJuCgpjcmVhdGU6Cglwcm90byAxIDAKCXJldHN1YgoKYmFyZV9yb3V0ZV9vcHRJbjoKCWJ5dGUgMHgKCWR1cG4gMQoJY2FsbHN1YiBvcHRJbgoJaW50IDEKCXJldHVybgoKb3B0SW46Cglwcm90byAxIDAKCXJldHN1YgoKYWJpX3JvdXRlX3N0YXRpY0FycmF5OgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMgoJY2FsbHN1YiBzdGF0aWNBcnJheQoJaW50IDEKCXJldHVybgoKc3RhdGljQXJyYXk6Cglwcm90byAyIDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjMwCgkvLyBhOiBTdGF0aWNBcnJheTx1aW50NjQsIDM+ID0gWzExLCAyMiwgMzNdCglieXRlIDB4MDAwMDAwMDAwMDAwMDAwYjAwMDAwMDAwMDAwMDAwMTYwMDAwMDAwMDAwMDAwMDIxCglmcmFtZV9idXJ5IC0xIC8vIGE6IHVpbnQ2NFszXQoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MzIKCS8vIHJldHVybiBhWzFdOwoJZnJhbWVfZGlnIC0xIC8vIGE6IHVpbnQ2NFszXQoJaW50IDgKCWludCA4CglleHRyYWN0MwoJYnRvaQoJaXRvYgoJYnl0ZSAweDE1MWY3Yzc1Cglzd2FwCgljb25jYXQKCWxvZwoJcmV0c3ViCgphYmlfcm91dGVfcmV0dXJuU3RhdGljQXJyYXk6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAyCgljYWxsc3ViIHJldHVyblN0YXRpY0FycmF5CglpbnQgMQoJcmV0dXJuCgpyZXR1cm5TdGF0aWNBcnJheToKCXByb3RvIDIgMAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MzYKCS8vIGE6IFN0YXRpY0FycmF5PHVpbnQ2NCwgMz4gPSBbMTEsIDIyLCAzM10KCWJ5dGUgMHgwMDAwMDAwMDAwMDAwMDBiMDAwMDAwMDAwMDAwMDAxNjAwMDAwMDAwMDAwMDAwMjEKCWZyYW1lX2J1cnkgLTEgLy8gYTogdWludDY0WzNdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czozOAoJLy8gcmV0dXJuIGE7CglmcmFtZV9kaWcgLTEgLy8gYTogdWludDY0WzNdCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCmFiaV9yb3V0ZV9zdGF0aWNBcnJheUFyZzoKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJYXNzZXJ0CglieXRlIDB4CglkdXBuIDEKCXR4bmEgQXBwbGljYXRpb25BcmdzIDEKCWNhbGxzdWIgc3RhdGljQXJyYXlBcmcKCWludCAxCglyZXR1cm4KCnN0YXRpY0FycmF5QXJnOgoJcHJvdG8gMiAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo0MgoJLy8gcmV0dXJuIGFbMV07CglmcmFtZV9kaWcgLTEgLy8gYTogdWludDY0WzNdCglpbnQgOAoJaW50IDgKCWV4dHJhY3QzCglidG9pCglpdG9iCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCmFiaV9yb3V0ZV9ub25MaXRlcmFsU3RhdGljQXJyYXlFbGVtZW50czoKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJYXNzZXJ0CglieXRlIDB4CglkdXBuIDUKCWNhbGxzdWIgbm9uTGl0ZXJhbFN0YXRpY0FycmF5RWxlbWVudHMKCWludCAxCglyZXR1cm4KCm5vbkxpdGVyYWxTdGF0aWNBcnJheUVsZW1lbnRzOgoJcHJvdG8gNSAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo0NgoJLy8gbjEgPSAxMQoJaW50IDExCglmcmFtZV9idXJ5IC0xIC8vIG4xOiB1aW50NjQKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjQ3CgkvLyBuMiA9IDIyCglpbnQgMjIKCWZyYW1lX2J1cnkgLTIgLy8gbjI6IHVpbnQ2NAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6NDgKCS8vIG4zID0gMzMKCWludCAzMwoJZnJhbWVfYnVyeSAtMyAvLyBuMzogdWludDY0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo0OQoJLy8gYTogU3RhdGljQXJyYXk8dWludDY0LCAzPiA9IFtuMSwgbjIsIG4zXQoJZnJhbWVfZGlnIC0xIC8vIG4xOiB1aW50NjQKCWl0b2IKCWZyYW1lX2RpZyAtMiAvLyBuMjogdWludDY0CglpdG9iCgljb25jYXQKCWZyYW1lX2RpZyAtMyAvLyBuMzogdWludDY0CglpdG9iCgljb25jYXQKCWZyYW1lX2J1cnkgLTQgLy8gYTogdWludDY0WzNdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo1MQoJLy8gcmV0dXJuIGFbMV07CglmcmFtZV9kaWcgLTQgLy8gYTogdWludDY0WzNdCglpbnQgOAoJaW50IDgKCWV4dHJhY3QzCglidG9pCglpdG9iCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCmFiaV9yb3V0ZV9taXhlZFN0YXRpY0FycmF5RWxlbWVudHM6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiA1CgljYWxsc3ViIG1peGVkU3RhdGljQXJyYXlFbGVtZW50cwoJaW50IDEKCXJldHVybgoKbWl4ZWRTdGF0aWNBcnJheUVsZW1lbnRzOgoJcHJvdG8gNSAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo1NQoJLy8gbjEgPSAzCglpbnQgMwoJZnJhbWVfYnVyeSAtMSAvLyBuMTogdWludDY0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo1NgoJLy8gbjIgPSA0CglpbnQgNAoJZnJhbWVfYnVyeSAtMiAvLyBuMjogdWludDY0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo1NwoJLy8gbjMgPSA1CglpbnQgNQoJZnJhbWVfYnVyeSAtMyAvLyBuMzogdWludDY0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo1OAoJLy8gYTogU3RhdGljQXJyYXk8dWludDY0LCA5PiA9IFswLCAxLCAyLCBuMSwgbjIsIG4zLCA2LCA3LCA4XQoJYnl0ZSAweDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDAwMDAwMDAwMgoJZnJhbWVfZGlnIC0xIC8vIG4xOiB1aW50NjQKCWl0b2IKCWNvbmNhdAoJZnJhbWVfZGlnIC0yIC8vIG4yOiB1aW50NjQKCWl0b2IKCWNvbmNhdAoJZnJhbWVfZGlnIC0zIC8vIG4zOiB1aW50NjQKCWl0b2IKCWNvbmNhdAoJYnl0ZSAweDAwMDAwMDAwMDAwMDAwMDYwMDAwMDAwMDAwMDAwMDA3MDAwMDAwMDAwMDAwMDAwOAoJY29uY2F0CglmcmFtZV9idXJ5IC00IC8vIGE6IHVpbnQ2NFs5XQoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6NjAKCS8vIHJldHVybiBhWzFdICsgYVs0XSArIGFbN107CglmcmFtZV9kaWcgLTQgLy8gYTogdWludDY0WzldCglpbnQgOAoJaW50IDgKCWV4dHJhY3QzCglidG9pCglmcmFtZV9kaWcgLTQgLy8gYTogdWludDY0WzldCglpbnQgMzIKCWludCA4CglleHRyYWN0MwoJYnRvaQoJKwoJZnJhbWVfZGlnIC00IC8vIGE6IHVpbnQ2NFs5XQoJaW50IDU2CglpbnQgOAoJZXh0cmFjdDMKCWJ0b2kKCSsKCWl0b2IKCWJ5dGUgMHgxNTFmN2M3NQoJc3dhcAoJY29uY2F0Cglsb2cKCXJldHN1YgoKYWJpX3JvdXRlX25vbkxpdGVyYWxTdGF0aWNBcnJheUFjY2VzczoKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJYXNzZXJ0CglieXRlIDB4CglkdXBuIDMKCWNhbGxzdWIgbm9uTGl0ZXJhbFN0YXRpY0FycmF5QWNjZXNzCglpbnQgMQoJcmV0dXJuCgpub25MaXRlcmFsU3RhdGljQXJyYXlBY2Nlc3M6Cglwcm90byAzIDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjY0CgkvLyBhOiBTdGF0aWNBcnJheTx1aW50NjQsIDM+ID0gWzExLCAyMiwgMzMsIDQ0XQoJYnl0ZSAweDAwMDAwMDAwMDAwMDAwMGIwMDAwMDAwMDAwMDAwMDE2MDAwMDAwMDAwMDAwMDAyMTAwMDAwMDAwMDAwMDAwMmMKCWZyYW1lX2J1cnkgLTEgLy8gYTogdWludDY0WzNdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo2NQoJLy8gbiA9IDIKCWludCAyCglmcmFtZV9idXJ5IC0yIC8vIG46IHVpbnQ2NAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6NjcKCS8vIHJldHVybiBhW25dOwoJZnJhbWVfZGlnIC0xIC8vIGE6IHVpbnQ2NFszXQoJZnJhbWVfZGlnIC0yIC8vIG46IHVpbnQ2NAoJaW50IDgKCSoKCWludCA4CglleHRyYWN0MwoJYnRvaQoJaXRvYgoJYnl0ZSAweDE1MWY3Yzc1Cglzd2FwCgljb25jYXQKCWxvZwoJcmV0c3ViCgphYmlfcm91dGVfc3RhdGljQXJyYXlJblN0b3JhZ2VSZWY6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAzCgljYWxsc3ViIHN0YXRpY0FycmF5SW5TdG9yYWdlUmVmCglpbnQgMQoJcmV0dXJuCgpzdGF0aWNBcnJheUluU3RvcmFnZVJlZjoKCXByb3RvIDMgMAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6ODEKCS8vIGE6IFN0YXRpY0FycmF5PHVpbnQ2NCwgMz4gPSBbMTEsIDIyLCAzM10KCWJ5dGUgMHgwMDAwMDAwMDAwMDAwMDBiMDAwMDAwMDAwMDAwMDAxNjAwMDAwMDAwMDAwMDAwMjEKCWZyYW1lX2J1cnkgLTEgLy8gYTogdWludDY0WzNdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo4MwoJLy8gdGhpcy5nUmVmLnB1dChhKQoJYnl0ZSAiZ1JlZiIKCWZyYW1lX2RpZyAtMSAvLyBhOiB1aW50NjRbM10KCWFwcF9nbG9iYWxfcHV0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo4NAoJLy8gdGhpcy5sUmVmLnB1dCh0aGlzLnR4bi5zZW5kZXIsIGEpCgl0eG4gU2VuZGVyCglieXRlICJsUmVmIgoJZnJhbWVfZGlnIC0xIC8vIGE6IHVpbnQ2NFszXQoJYXBwX2xvY2FsX3B1dAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6ODUKCS8vIHRoaXMuYlJlZi5wdXQoYSkKCWJ5dGUgImJSZWYiCglmcmFtZV9kaWcgLTEgLy8gYTogdWludDY0WzNdCglib3hfcHV0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo4NwoJLy8gcmV0OiBTdGF0aWNBcnJheTx1aW50NjQsIDM+ID0gWwoJYnl0ZSAiZ1JlZiIKCWFwcF9nbG9iYWxfZ2V0CglpbnQgOAoJaW50IDgKCWV4dHJhY3QzCglidG9pCglpdG9iCgl0eG4gU2VuZGVyCglieXRlICJsUmVmIgoJYXBwX2xvY2FsX2dldAoJaW50IDgKCWludCA4CglleHRyYWN0MwoJYnRvaQoJaXRvYgoJY29uY2F0CglieXRlICJiUmVmIgoJYm94X2dldAoJYXNzZXJ0CglpbnQgOAoJaW50IDgKCWV4dHJhY3QzCglidG9pCglpdG9iCgljb25jYXQKCWZyYW1lX2J1cnkgLTIgLy8gcmV0OiB1aW50NjRbM10KCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjkzCgkvLyByZXR1cm4gcmV0OwoJZnJhbWVfZGlnIC0yIC8vIHJldDogdWludDY0WzNdCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCmFiaV9yb3V0ZV9zdGF0aWNBcnJheUluU3RvcmFnZU1hcDoKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJYXNzZXJ0CglieXRlIDB4CglkdXBuIDMKCWNhbGxzdWIgc3RhdGljQXJyYXlJblN0b3JhZ2VNYXAKCWludCAxCglyZXR1cm4KCnN0YXRpY0FycmF5SW5TdG9yYWdlTWFwOgoJcHJvdG8gMyAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czoxMTkKCS8vIGE6IFN0YXRpY0FycmF5PHVpbnQ2NCwgMz4gPSBbMTEsIDIyLCAzM10KCWJ5dGUgMHgwMDAwMDAwMDAwMDAwMDBiMDAwMDAwMDAwMDAwMDAxNjAwMDAwMDAwMDAwMDAwMjEKCWZyYW1lX2J1cnkgLTEgLy8gYTogdWludDY0WzNdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czoxMjEKCS8vIHRoaXMuZ01hcC5wdXQoJ2dNYXAnLCBhKQoJYnl0ZSAiZ01hcCIKCWZyYW1lX2RpZyAtMSAvLyBhOiB1aW50NjRbM10KCWFwcF9nbG9iYWxfcHV0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czoxMjIKCS8vIHRoaXMubE1hcC5wdXQodGhpcy50eG4uc2VuZGVyLCAnbE1hcCcsIGEpCgl0eG4gU2VuZGVyCglieXRlICJsTWFwIgoJZnJhbWVfZGlnIC0xIC8vIGE6IHVpbnQ2NFszXQoJYXBwX2xvY2FsX3B1dAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MTIzCgkvLyB0aGlzLmJNYXAucHV0KCdiTWFwJywgYSkKCWJ5dGUgImJNYXAiCglmcmFtZV9kaWcgLTEgLy8gYTogdWludDY0WzNdCglib3hfcHV0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czoxMjUKCS8vIHJldDogU3RhdGljQXJyYXk8dWludDY0LCAzPiA9IFsKCWJ5dGUgImdNYXAiCglhcHBfZ2xvYmFsX2dldAoJaW50IDgKCWludCA4CglleHRyYWN0MwoJYnRvaQoJaXRvYgoJdHhuIFNlbmRlcgoJYnl0ZSAibE1hcCIKCWFwcF9sb2NhbF9nZXQKCWludCA4CglpbnQgOAoJZXh0cmFjdDMKCWJ0b2kKCWl0b2IKCWNvbmNhdAoJYnl0ZSAiYk1hcCIKCWJveF9nZXQKCWFzc2VydAoJaW50IDgKCWludCA4CglleHRyYWN0MwoJYnRvaQoJaXRvYgoJY29uY2F0CglmcmFtZV9idXJ5IC0yIC8vIHJldDogdWludDY0WzNdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czoxMzEKCS8vIHJldHVybiByZXQ7CglmcmFtZV9kaWcgLTIgLy8gcmV0OiB1aW50NjRbM10KCWJ5dGUgMHgxNTFmN2M3NQoJc3dhcAoJY29uY2F0Cglsb2cKCXJldHN1YgoKYWJpX3JvdXRlX3NpbXBsZVR1cGxlOgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMgoJY2FsbHN1YiBzaW1wbGVUdXBsZQoJaW50IDEKCXJldHVybgoKc2ltcGxlVHVwbGU6Cglwcm90byAyIDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjE4OQoJLy8gYTogW3VpbnQ2NCwgdWludDE2LCB1aW50NjQsIHVpbnQxNl0gPSBbMTEsIDIyLCAzMywgNDRdCglieXRlIDB4MDAwMDAwMDAwMDAwMDAwYjAwMTYwMDAwMDAwMDAwMDAwMDIxMDAyYwoJZnJhbWVfYnVyeSAtMSAvLyBhOiBbdWludDY0LCB1aW50MTYsIHVpbnQ2NCwgdWludDE2XQoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MTkxCgkvLyByZXR1cm4gYVszXTsKCWZyYW1lX2RpZyAtMSAvLyBhOiBbdWludDY0LCB1aW50MTYsIHVpbnQ2NCwgdWludDE2XQoJaW50IDE4CglpbnQgMgoJZXh0cmFjdDMKCWJ5dGUgMHhGRkZGCgliJgoJYnl0ZSAweDE1MWY3Yzc1Cglzd2FwCgljb25jYXQKCWxvZwoJcmV0c3ViCgphYmlfcm91dGVfYXJyYXlJblR1cGxlOgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMgoJY2FsbHN1YiBhcnJheUluVHVwbGUKCWludCAxCglyZXR1cm4KCmFycmF5SW5UdXBsZToKCXByb3RvIDIgMAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MTk1CgkvLyBhOiBbdWludDY0LCB1aW50MTYsIFN0YXRpY0FycmF5PHVpbnQ2NCwgMj4sIHVpbnQxNl0gPSBbCglieXRlIDB4MDAwMDAwMDAwMDAwMDAwYjAwMTYKCWJ5dGUgMHgwMDAwMDAwMDAwMDAwMDIxMDAwMDAwMDAwMDAwMDAyYwoJY29uY2F0CglieXRlIDB4MDAzNwoJY29uY2F0CglmcmFtZV9idXJ5IC0xIC8vIGE6IFt1aW50NjQsIHVpbnQxNiwgc3RhdGljYXJyYXk8dWludDY0LCAyPiwgdWludDE2XQoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MTk5CgkvLyByZXR1cm4gYVsyXVsxXTsKCWZyYW1lX2RpZyAtMSAvLyBhOiBbdWludDY0LCB1aW50MTYsIHN0YXRpY2FycmF5PHVpbnQ2NCwgMj4sIHVpbnQxNl0KCWludCAxOAoJaW50IDgKCWV4dHJhY3QzCglidG9pCglpdG9iCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCmFiaV9yb3V0ZV90dXBsZUluQXJyYXk6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAyCgljYWxsc3ViIHR1cGxlSW5BcnJheQoJaW50IDEKCXJldHVybgoKdHVwbGVJbkFycmF5OgoJcHJvdG8gMiAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czoyMDMKCS8vIGE6IFN0YXRpY0FycmF5PFt1aW50NjQsIHVpbnQxNl0sIDI+ID0gWwoJYnl0ZSAweDAwMDAwMDAwMDAwMDAwMGIwMDAwMDAwMDAwMDAwMDE2CglieXRlIDB4MDAyMTAwMmMKCWNvbmNhdAoJZnJhbWVfYnVyeSAtMSAvLyBhOiBbdWludDY0LCB1aW50MTZdWzJdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czoyMDcKCS8vIHJldHVybiBhWzFdWzFdOwoJZnJhbWVfZGlnIC0xIC8vIGE6IFt1aW50NjQsIHVpbnQxNl1bMl0KCWludCAxOAoJaW50IDIKCWV4dHJhY3QzCglieXRlIDB4RkZGRgoJYiYKCWJ5dGUgMHgxNTFmN2M3NQoJc3dhcAoJY29uY2F0Cglsb2cKCXJldHN1YgoKYWJpX3JvdXRlX3R1cGxlSW5UdXBsZToKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJYXNzZXJ0CglieXRlIDB4CglkdXBuIDIKCWNhbGxzdWIgdHVwbGVJblR1cGxlCglpbnQgMQoJcmV0dXJuCgp0dXBsZUluVHVwbGU6Cglwcm90byAyIDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjIxMQoJLy8gYTogW3VpbnQxNiwgdWludDE2LCBbdWludDY0LCB1aW50MTZdLCBbdWludDE2LCB1aW50NjRdXSA9IFsKCWJ5dGUgMHgwMDBiMDAxNgoJYnl0ZSAweDAwMDAwMDAwMDAwMDAwMjEwMDJjCgljb25jYXQKCWJ5dGUgMHgwMDM3MDAwMDAwMDAwMDAwMDA0MgoJY29uY2F0CglmcmFtZV9idXJ5IC0xIC8vIGE6IFt1aW50MTYsIHVpbnQxNiwgW3VpbnQ2NCwgdWludDE2XSwgW3VpbnQxNiwgdWludDY0XV0KCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjIxNQoJLy8gcmV0dXJuIGFbM11bMV07CglmcmFtZV9kaWcgLTEgLy8gYTogW3VpbnQxNiwgdWludDE2LCBbdWludDY0LCB1aW50MTZdLCBbdWludDE2LCB1aW50NjRdXQoJaW50IDE2CglpbnQgOAoJZXh0cmFjdDMKCWJ0b2kKCWl0b2IKCWJ5dGUgMHgxNTFmN2M3NQoJc3dhcAoJY29uY2F0Cglsb2cKCXJldHN1YgoKYWJpX3JvdXRlX3Nob3J0VHlwZU5vdGF0aW9uOgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMgoJY2FsbHN1YiBzaG9ydFR5cGVOb3RhdGlvbgoJaW50IDEKCXJldHVybgoKc2hvcnRUeXBlTm90YXRpb246Cglwcm90byAyIDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjIxOQoJLy8gYTogW3VpbnQxNjwyPiwgdWludDY0PDI+LCB1aW50MTY8Mj5dID0gWwoJYnl0ZSAweDAwMGIwMDE2CglieXRlIDB4MDAwMDAwMDAwMDAwMDAyMTAwMDAwMDAwMDAwMDAwMmMKCWNvbmNhdAoJYnl0ZSAweDAwMzcwMDQyCgljb25jYXQKCWZyYW1lX2J1cnkgLTEgLy8gYTogW3VpbnQxNjwyPiwgdWludDY0PDI+LCB1aW50MTY8Mj5dCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czoyMjMKCS8vIHJldHVybiBhWzJdWzFdOwoJZnJhbWVfZGlnIC0xIC8vIGE6IFt1aW50MTY8Mj4sIHVpbnQ2NDwyPiwgdWludDE2PDI+XQoJaW50IDIyCglpbnQgMgoJZXh0cmFjdDMKCWJ5dGUgMHhGRkZGCgliJgoJYnl0ZSAweDE1MWY3Yzc1Cglzd2FwCgljb25jYXQKCWxvZwoJcmV0c3ViCgptYWluOgoJdHhuIE51bUFwcEFyZ3MKCWJueiByb3V0ZV9hYmkKCXR4biBBcHBsaWNhdGlvbklECglpbnQgMAoJPT0KCWludCBPcHRJbgoJdHhuIE9uQ29tcGxldGlvbgoJPT0KCXR4biBBcHBsaWNhdGlvbklECglpbnQgMAoJIT0KCSYmCglpbnQgMQoJbWF0Y2ggYmFyZV9yb3V0ZV9jcmVhdGUgYmFyZV9yb3V0ZV9vcHRJbgoKcm91dGVfYWJpOgoJbWV0aG9kICJzdGF0aWNBcnJheSgpdWludDY0IgoJbWV0aG9kICJyZXR1cm5TdGF0aWNBcnJheSgpdWludDY0WzNdIgoJbWV0aG9kICJzdGF0aWNBcnJheUFyZyh1aW50NjRbM10pdWludDY0IgoJbWV0aG9kICJub25MaXRlcmFsU3RhdGljQXJyYXlFbGVtZW50cygpdWludDY0IgoJbWV0aG9kICJtaXhlZFN0YXRpY0FycmF5RWxlbWVudHMoKXVpbnQ2NCIKCW1ldGhvZCAibm9uTGl0ZXJhbFN0YXRpY0FycmF5QWNjZXNzKCl1aW50NjQiCgltZXRob2QgInN0YXRpY0FycmF5SW5TdG9yYWdlUmVmKCl1aW50NjRbM10iCgltZXRob2QgInN0YXRpY0FycmF5SW5TdG9yYWdlTWFwKCl1aW50NjRbM10iCgltZXRob2QgInNpbXBsZVR1cGxlKCl1aW50MTYiCgltZXRob2QgImFycmF5SW5UdXBsZSgpdWludDY0IgoJbWV0aG9kICJ0dXBsZUluQXJyYXkoKXVpbnQxNiIKCW1ldGhvZCAidHVwbGVJblR1cGxlKCl1aW50NjQiCgltZXRob2QgInNob3J0VHlwZU5vdGF0aW9uKCl1aW50MTYiCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAwCgltYXRjaCBhYmlfcm91dGVfc3RhdGljQXJyYXkgYWJpX3JvdXRlX3JldHVyblN0YXRpY0FycmF5IGFiaV9yb3V0ZV9zdGF0aWNBcnJheUFyZyBhYmlfcm91dGVfbm9uTGl0ZXJhbFN0YXRpY0FycmF5RWxlbWVudHMgYWJpX3JvdXRlX21peGVkU3RhdGljQXJyYXlFbGVtZW50cyBhYmlfcm91dGVfbm9uTGl0ZXJhbFN0YXRpY0FycmF5QWNjZXNzIGFiaV9yb3V0ZV9zdGF0aWNBcnJheUluU3RvcmFnZVJlZiBhYmlfcm91dGVfc3RhdGljQXJyYXlJblN0b3JhZ2VNYXAgYWJpX3JvdXRlX3NpbXBsZVR1cGxlIGFiaV9yb3V0ZV9hcnJheUluVHVwbGUgYWJpX3JvdXRlX3R1cGxlSW5BcnJheSBhYmlfcm91dGVfdHVwbGVJblR1cGxlIGFiaV9yb3V0ZV9zaG9ydFR5cGVOb3RhdGlvbg==";
    override clearProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKaW50IDEKcmV0dXJu";
    override methods: algosdk.ABIMethod[] = [
        new algosdk.ABIMethod({ name: "staticArray", desc: "", args: [], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "returnStaticArray", desc: "", args: [], returns: { type: "uint64[3]", desc: "" } }),
        new algosdk.ABIMethod({ name: "staticArrayArg", desc: "", args: [{ type: "uint64[3]", name: "a", desc: "" }], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "nonLiteralStaticArrayElements", desc: "", args: [], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "mixedStaticArrayElements", desc: "", args: [], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "nonLiteralStaticArrayAccess", desc: "", args: [], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "staticArrayInStorageRef", desc: "", args: [], returns: { type: "uint64[3]", desc: "" } }),
        new algosdk.ABIMethod({ name: "staticArrayInStorageMap", desc: "", args: [], returns: { type: "uint64[3]", desc: "" } }),
        new algosdk.ABIMethod({ name: "simpleTuple", desc: "", args: [], returns: { type: "uint16", desc: "" } }),
        new algosdk.ABIMethod({ name: "arrayInTuple", desc: "", args: [], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "tupleInArray", desc: "", args: [], returns: { type: "uint16", desc: "" } }),
        new algosdk.ABIMethod({ name: "tupleInTuple", desc: "", args: [], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "shortTypeNotation", desc: "", args: [], returns: { type: "uint16", desc: "" } })
    ];
    async staticArray(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.staticArray(txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    async returnStaticArray(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint[]>> {
        const result = await this.execute(await this.compose.returnStaticArray(txnParams));
        return new bkr.ABIResult<bigint[]>(result, result.returnValue as bigint[]);
    }
    async staticArrayArg(args: {
        a: bigint[];
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.staticArrayArg({ a: args.a }, txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    async nonLiteralStaticArrayElements(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.nonLiteralStaticArrayElements(txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    async mixedStaticArrayElements(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.mixedStaticArrayElements(txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    async nonLiteralStaticArrayAccess(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.nonLiteralStaticArrayAccess(txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    async staticArrayInStorageRef(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint[]>> {
        const result = await this.execute(await this.compose.staticArrayInStorageRef(txnParams));
        return new bkr.ABIResult<bigint[]>(result, result.returnValue as bigint[]);
    }
    async staticArrayInStorageMap(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint[]>> {
        const result = await this.execute(await this.compose.staticArrayInStorageMap(txnParams));
        return new bkr.ABIResult<bigint[]>(result, result.returnValue as bigint[]);
    }
    async simpleTuple(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.simpleTuple(txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    async arrayInTuple(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.arrayInTuple(txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    async tupleInArray(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.tupleInArray(txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    async tupleInTuple(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.tupleInTuple(txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    async shortTypeNotation(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.shortTypeNotation(txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    compose = {
        staticArray: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "staticArray"), {}, txnParams, atc);
        },
        returnStaticArray: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "returnStaticArray"), {}, txnParams, atc);
        },
        staticArrayArg: async (args: {
            a: bigint[];
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "staticArrayArg"), { a: args.a }, txnParams, atc);
        },
        nonLiteralStaticArrayElements: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "nonLiteralStaticArrayElements"), {}, txnParams, atc);
        },
        mixedStaticArrayElements: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "mixedStaticArrayElements"), {}, txnParams, atc);
        },
        nonLiteralStaticArrayAccess: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "nonLiteralStaticArrayAccess"), {}, txnParams, atc);
        },
        staticArrayInStorageRef: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "staticArrayInStorageRef"), {}, txnParams, atc);
        },
        staticArrayInStorageMap: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "staticArrayInStorageMap"), {}, txnParams, atc);
        },
        simpleTuple: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "simpleTuple"), {}, txnParams, atc);
        },
        arrayInTuple: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "arrayInTuple"), {}, txnParams, atc);
        },
        tupleInArray: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "tupleInArray"), {}, txnParams, atc);
        },
        tupleInTuple: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "tupleInTuple"), {}, txnParams, atc);
        },
        shortTypeNotation: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "shortTypeNotation"), {}, txnParams, atc);
        }
    };
}
