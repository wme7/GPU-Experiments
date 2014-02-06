#version 150

out vec4 color0;
out vec4 color1;

in vec2 uv;

uniform sampler2D QTex;
uniform sampler2D SxTex;
uniform sampler2D SyTex;

uniform float gamma;


float P(in vec4 Q){
    float c = dot(Q.yz,Q.yz)/Q.x;
    return (gamma-1.0)*(Q.w-0.5*c);
}

vec4 fflux(in vec4 Q){
    float u = Q.y/Q.x;
    float p = P(Q);
    return vec4(Q.y,
                (Q.y*u)+p,
                Q.z*u,
                u*(Q.w+p));
}
vec4 gflux(in vec4 Q){
    float v = Q.z/Q.x;    
    float p = P(Q);
    return vec4(Q.z,
                Q.y*v,
                (Q.z*v)+p,
                v*(Q.w+p));
}

vec4 xflux(in float k){
    vec4 Q      = texture(QTex, uv);
    vec4 Sx     = texture(SxTex, uv);
    vec4 Sy     = texture(SyTex, uv);
    vec4 QL     = Q + Sx*0.5;
    vec4 QLp    = Q + Sx*0.5 + Sy*k;
    vec4 QLm    = Q + Sx*0.5 - Sy*k;
    
    vec4 Q1     = textureOffset(QTex, uv, ivec2(1,0));
    vec4 Sxp    = textureOffset(SxTex, uv, ivec2(1,0));
    vec4 Syp    = textureOffset(SyTex, uv, ivec2(1,0));
    vec4 QR     = Q1 + Sxp*0.5;
    vec4 QRp    = Q1 + Sxp*0.5 + Syp*k;
    vec4 QRm    = Q1 + Sxp*0.5 - Syp*k;
    
    float c, ap, am;
    c           = sqrt(gamma*QL.x*P(QL));
    ap          = max((QL.y+c)/QL.x,0.0);
    am          = min((QL.y-c)/QL.x,0.0);
    c           = sqrt(gamma*QR.x*P(QR));
    ap          = max((QR.y+c)/QR.x,ap);
    am          = min((QR.y-c)/QR.x,am);
    
    vec4 Fp     = ((ap*fflux(QLp) - am*fflux(QRp)) + (ap*am)*(QRp-QLp))/(ap-am);
    vec4 Fm     = ((ap*fflux(QLm) - am*fflux(QRm)) + (ap*am)*(QRm-QLm))/(ap-am);
    return mix(Fp, Fm, 0.5);
}

vec4 yflux(in float k){
    vec4 Q      = texture(QTex, uv);
    vec4 Sx     = texture(SxTex, uv);
    vec4 Sy     = texture(SyTex, uv);
    vec4 QL     = Q + Sx*0.5;
    vec4 QLp    = Q + Sx*0.5 + Sy*k;
    vec4 QLm    = Q + Sx*0.5 - Sy*k;
    
    vec4 Q1     = textureOffset(QTex, uv, ivec2(0,1));
    vec4 Sxp    = textureOffset(SxTex, uv, ivec2(0,1));
    vec4 Syp    = textureOffset(SyTex, uv, ivec2(0,1));
    vec4 QR     = Q1 + Sxp*0.5;
    vec4 QRp    = Q1 + Sxp*0.5 + Syp*k;
    vec4 QRm    = Q1 + Sxp*0.5 - Syp*k;
    
    float c, ap, am;
    c           = sqrt(gamma*QL.x*P(QL));
    ap          = max((QL.z+c)/QL.x,0.0);
    am          = min((QL.z-c)/QL.x,0.0);
    c           = sqrt(gamma*QR.x*P(QR));
    ap          = max((QR.z+c)/QR.x,ap);
    am          = min((QR.z-c)/QR.x,am);
    
    vec4 Fp     = ((ap*gflux(QLp) - am*gflux(QRp)) + (ap*am)*(QRp-QLp))/(ap-am);
    vec4 Fm     = ((ap*gflux(QLm) - am*gflux(QRm)) + (ap*am)*(QRm-QLm))/(ap-am);
    return mix(Fp, Fm, 0.5);

}

void main(){
    const float k = 0.2886751346;
    
    color0 = xflux(k);
    color1 = yflux(k);
}